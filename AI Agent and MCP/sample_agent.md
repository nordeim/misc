# Programming guide for an AI agent that summarizes recent unread emails

You’re aiming for a production-ready agent that triggers via chat, uses OpenAI as the LLM, retrieves the 10 most recent unread emails, and returns a clean summary. Below is a modular, secure, and testable blueprint with ready-to-run Python code, aligned to long-term maintainability and operational excellence.

---

## Overview

This guide designs a small, composable agent with:

- **Chat trigger:** User input initiates the agent flow (e.g., “Summarize my unread emails”).
- **LLM Orchestration:** OpenAI for planning and summarization.
- **Email retrieval tool:** Microsoft Graph API to get the latest 10 unread emails.
- **Output:** Clear, structured summary useful for triage and next steps.
- **Security & testing:** Least privilege, safe secrets handling, and coverage for critical paths.

---

## Architecture

- **Driver (Chat):** A FastAPI endpoint or CLI that takes a natural-language command.
- **Agent Orchestrator:** Routes intent, calls tools, structures responses.
- **Tools:**
  - **EmailTool:** Fetches unread emails via Microsoft Graph (OAuth2/MSAL).
  - **Summarizer:** Prompts OpenAI to produce concise summaries.
- **Config:** `.env` for secrets; typed settings for reliability.
- **Storage:** Ephemeral memory (in-process). Replaceable with Redis if needed.

Data flow:
1. User sends: “Summarize unread emails.”
2. Agent validates intent → calls EmailTool → gets top 10 unread.
3. Agent feeds emails to LLM → returns structured summary.
4. Response delivered to chat.

---

## Prerequisites

- Python 3.10+
- An Azure AD app registered with permissions to read mail:
  - Microsoft Graph delegated permissions: Mail.Read
- A mailbox for the signed-in user
- OpenAI API key

---

## Setup

#### 1) Install dependencies

```bash
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install fastapi uvicorn pydantic python-dotenv msal requests openai
```

#### 2) Environment variables (.env)

```
OPENAI_API_KEY=sk-...
GRAPH_TENANT_ID=your-tenant-id
GRAPH_CLIENT_ID=your-client-id
GRAPH_CLIENT_SECRET=your-client-secret
GRAPH_SCOPE=https://graph.microsoft.com/.default
GRAPH_USER_ID=me
```

- Use `GRAPH_USER_ID=me` for the signed-in user via delegated flow. For app-only you’ll need application permissions and a specific user mailbox ID.

---

## Configuration and models

#### settings.py
```python
from pydantic import BaseSettings, SecretStr

class Settings(BaseSettings):
    openai_api_key: SecretStr
    graph_tenant_id: str
    graph_client_id: str
    graph_client_secret: SecretStr
    graph_scope: str = "https://graph.microsoft.com/.default"
    graph_user_id: str = "me"

    class Config:
        env_file = ".env"

settings = Settings()
```

#### models.py
```python
from pydantic import BaseModel
from typing import List, Optional

class EmailItem(BaseModel):
    id: str
    subject: Optional[str]
    from_name: Optional[str]
    from_address: Optional[str]
    received_datetime: Optional[str]
    preview: Optional[str]

class EmailSummary(BaseModel):
    total_unread: int
    items: List[dict]  # summarized entries with priority, topic, next steps
```

---

## Email retrieval tool (Microsoft Graph)

#### email_tool.py
```python
import requests
import msal
from typing import List
from settings import settings
from models import EmailItem

GRAPH_BASE = "https://graph.microsoft.com/v1.0"

class GraphEmailTool:
    def __init__(self):
        self._app = msal.ConfidentialClientApplication(
            client_id=settings.graph_client_id,
            authority=f"https://login.microsoftonline.com/{settings.graph_tenant_id}",
            client_credential=settings.graph_client_secret.get_secret_value(),
        )

    def _token(self) -> str:
        result = self._app.acquire_token_silent(scopes=[settings.graph_scope], account=None)
        if not result:
            result = self._app.acquire_token_for_client(scopes=[settings.graph_scope])
        if "access_token" not in result:
            raise RuntimeError(f"Graph token acquisition failed: {result.get('error_description')}")
        return result["access_token"]

    def fetch_unread_emails(self, top: int = 10) -> List[EmailItem]:
        token = self._token()
        headers = {"Authorization": f"Bearer {token}"}
        # Filter unread, order by receivedDateTime desc, pull essential fields
        params = {
            "$top": str(top),
            "$filter": "isRead eq false",
            "$orderby": "receivedDateTime desc",
            "$select": "id,subject,from,receivedDateTime,bodyPreview"
        }
        url = f"{GRAPH_BASE}/users/{settings.graph_user_id}/mailFolders/Inbox/messages"
        r = requests.get(url, headers=headers, params=params, timeout=15)
        r.raise_for_status()
        data = r.json()
        items = []
        for m in data.get("value", []):
            sender = m.get("from", {}).get("emailAddress", {})
            items.append(EmailItem(
                id=m.get("id"),
                subject=m.get("subject"),
                from_name=sender.get("name"),
                from_address=sender.get("address"),
                received_datetime=m.get("receivedDateTime"),
                preview=m.get("bodyPreview")
            ))
        return items
```

Notes:
- Uses application flow with `.default` scope. If you need delegated user consent and SSO across chat, adapt to a web auth flow with MSAL and user tokens.
- Least privilege: Mail.Read only.

---

## LLM summarization

#### summarizer.py
```python
from typing import List
from models import EmailItem, EmailSummary
from openai import OpenAI
from settings import settings

SYSTEM_PROMPT = """You are an assistant that creates an actionable summary of unread emails.
- Group by topic and urgency.
- Include sender, subject, and a one-liner gist.
- Suggest next steps for each item.
- Keep it concise and scannable.
- If previews are vague, infer cautiously without fabricating details."""

def summarize_unread_emails(emails: List[EmailItem]) -> EmailSummary:
    client = OpenAI(api_key=settings.openai_api_key.get_secret_value())

    # Prepare compact content for the model
    email_lines = []
    for e in emails:
        email_lines.append(
            f"- From: {e.from_name or 'Unknown'} <{e.from_address or ''}> | "
            f"Subject: {e.subject or '(No subject)'} | "
            f"Received: {e.received_datetime or ''} | "
            f"Preview: {e.preview or ''}"
        )

    user_prompt = (
        "Summarize the following unread emails into grouped topics, priority ratings "
        "(High/Medium/Low), and recommended next steps.\n\n"
        + "\n".join(email_lines)
    )

    resp = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt}
        ],
        temperature=0.2,
    )

    content = resp.choices[0].message.content

    # Return raw content wrapped; you can parse JSON with a constrained prompt if desired
    return EmailSummary(
        total_unread=len(emails),
        items=[{"summary": content}]
    )
```

Tip:
- If you need structured JSON, change the prompt to “Output valid JSON with fields: topics[], items[], next_steps[]” and validate.

---

## Agent orchestration and chat trigger

#### agent.py
```python
from typing import Dict, Any
from email_tool import GraphEmailTool
from summarizer import summarize_unread_emails

class EmailSummaryAgent:
    def __init__(self):
        self.tool = GraphEmailTool()

    def handle_request(self, text: str) -> Dict[str, Any]:
        intent = text.strip().lower()
        if "unread" in intent and "email" in intent or "summarize email" in intent:
            emails = self.tool.fetch_unread_emails(top=10)
            if not emails:
                return {"message": "No unread emails found.", "total_unread": 0}
            summary = summarize_unread_emails(emails)
            return {
                "total_unread": summary.total_unread,
                "summary": summary.items[0]["summary"]
            }
        else:
            return {"message": "Try: 'Summarize my unread emails'."}
```

#### app.py (FastAPI chat endpoint)
```python
from fastapi import FastAPI
from pydantic import BaseModel
from agent import EmailSummaryAgent

app = FastAPI()
agent = EmailSummaryAgent()

class ChatInput(BaseModel):
    text: str

@app.post("/chat")
def chat(input: ChatInput):
    result = agent.handle_request(input.text)
    return result
```

Run:
```bash
uvicorn app:app --host 0.0.0.0 --port 8000
```

---

## Output formatting

The endpoint returns JSON like:
```json
{
  "total_unread": 10,
  "summary": "Topics: Project updates (High)...\n- Sender: ... Subject: ... Action: ..."
}
```

For UI, render as:
- Headline: “10 unread emails summarized”
- Sections: Topics grouped by priority
- Bullets: Sender, subject, one-liner gist, recommended next step
- Accessibility: High-contrast, semantic headings, keyboard navigable components

---

## Security, performance, and reliability

- **Secrets:** Use environment variables; never hardcode. Consider Azure Key Vault for production.
- **Scopes:** Grant only Mail.Read (delegated or application). Review consent.
- **Timeouts & retries:** Add request timeouts (already included) and implement graceful retry/backoff for Graph.
- **Pagination & scale:** For more than 10, handle pagination; keep payload small for LLM cost/perf.
- **Rate limiting:** Cache tokens; respect Graph and OpenAI rate limits.
- **Logging:** Structured logs with request IDs; avoid logging email content in production unless necessary.
- **Error handling:** Return helpful messages for auth failures, empty inbox, and API errors.

---

## Tests

#### tests/test_email_tool.py
```python
import pytest
from email_tool import GraphEmailTool

def test_fetch_unread_emails_smoke(monkeypatch):
    tool = GraphEmailTool()
    # If you can't call live Graph in CI, mock requests.get and msal token.
    # Here we just ensure the method exists.
    assert hasattr(tool, "fetch_unread_emails")
```

#### tests/test_summarizer.py
```python
from summarizer import summarize_unread_emails
from models import EmailItem

def test_summarize_basic():
    emails = [
        EmailItem(id="1", subject="Update", from_name="Alice", from_address="alice@example.com",
                  received_datetime="2025-10-15T10:00:00Z", preview="Project status..."),
        EmailItem(id="2", subject="Invoice", from_name="Billing", from_address="billing@example.com",
                  received_datetime="2025-10-15T09:00:00Z", preview="Attached invoice...")
    ]
    summary = summarize_unread_emails(emails)
    assert summary.total_unread == 2
    assert summary.items and "summary" in summary.items[0]
```

#### tests/test_agent.py
```python
from agent import EmailSummaryAgent

def test_agent_prompt_routing():
    agent = EmailSummaryAgent()
    res = agent.handle_request("Summarize my unread emails")
    assert "message" in res or "summary" in res
```

Mock network calls for deterministic CI. Consider adding JSON schema validation for structured outputs.

---

## Deployment

- **Containerization:** Use Docker with non-root user, health checks, and environment injection.
- **Monitoring:** Add request metrics, latency histograms, and error counters. Introduce alerting for auth failures or Graph 5xx spikes.
- **Scaling:** Horizontal scale behind a reverse proxy. Limit concurrent LLM calls per user/request.

#### Dockerfile (minimal)
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY . /app
RUN pip install --no-cache-dir fastapi uvicorn pydantic python-dotenv msal requests openai
ENV PYTHONUNBUFFERED=1
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
```

---

## Usage examples

- Chat input: “Summarize my unread emails.”
- Response: Actionable summary grouped by topic and urgency, with recommended next steps.

If you need this wired into an existing agent framework:
- Plug `GraphEmailTool` as a Tool/Capability.
- Wrap `summarize_unread_emails` as a Planner/LLM step.
- Register the “Summarize unread emails” intent in your router.

---

## Extensions and next steps

- **Structured output:** Force JSON schema and render cards in UI.
- **Follow-up actions:** “Reply,” “Archive,” “Flag,” via Graph write permissions.
- **Noise control:** Filter newsletters vs. human senders; prioritize based on sender importance.
- **Auditability:** Log the decision path (tool calls, prompt versions) without storing sensitive email content.
- **Observability:** Add Prometheus metrics: request_count, graph_latency_seconds, llm_tokens_used, and result_size_bytes.

---

https://copilot.microsoft.com/shares/DckMUVMM6NbPB9JL7GRHW
