# Context7 MCP → Practical, production-ready setup & sample prompts

Below is a meticulous, copy-pasteable guide to configure **Context7 (Upstash) MCP** for three popular AI coding agents — **Cursor**, **VS Code + GitHub Copilot**, and **Claude Code (CLI)** — followed by a robust MCP-aware prompt you can use to instruct the agent to fetch the *latest n8n* docs and then produce an n8n workflow **as an importable JSON artifact**. I include security notes, validation steps, and a concrete example n8n workflow JSON you can import into n8n to verify everything.

> Sources used while assembling this guide: Context7 GitHub & releases, Upstash blog post about Context7 MCP, Cursor MCP docs, VS Code / GitHub Copilot MCP docs, Anthropic (Claude Code) MCP docs, and the Context7 npm package. ([GitHub][1])

---

# Quick orientation (2 lines)

* **What Context7 is:** an MCP server that surfaces up-to-date, versioned documentation/knowledge to MCP-capable LLM clients so models can reference *live docs* rather than stale training data. Upstash distributes/hosts Context7 as an MCP server option. ([Upstash: Serverless Data Platform][2])
* **What you’ll do:** deploy or use Upstash’s Context7 MCP server (hosted or self-hosted), configure your agent to trust that MCP server, then prompt the agent to fetch n8n docs and to generate a workflow JSON. ([npm][3])

---

# Common prerequisites (do these first)

1. Decide: use **Upstash-hosted Context7** (fast) or **self-hosted context7** from the GitHub repo. Upstash publishes an MCP wrapper package and a hosted offering. ([npm][3])
2. Acquire the Context7 server URL and (if provided) an API key or token. Treat this value as sensitive.
3. Ensure the target AI client (Cursor / Copilot / Claude Code) is a **MCP-capable client** and up-to-date. (Docs show Cursor, Copilot in VS Code, and Claude Code all support MCP.) ([Cursor][4])
4. Prepare non-production n8n instance (staging) to safely run/test imported workflows; never run generated workflows in production without validating credentials and behavior.

---

# 1) Cursor — Context7 configuration (copy-paste ready)

### Why this is simple

Cursor has first-class MCP support and even an **MCP directory / install flow**; Context7 provides recommended install snippets specifically for Cursor. ([Cursor][5])

### Where to put the config

Cursor supports a global `~/.cursor/mcp.json` or a per-project `.cursor/mcp.json`.

### Example `~/.cursor/mcp.json` (replace placeholders)

```json
{
  "servers": [
    {
      "name": "Context7-Upstash",
      "url": "https://mcp.context7.upstash.io",        // <- replace with your Context7 URL
      "description": "Context7 MCP server (Upstash) - up-to-date docs",
      "transport": "http",
      "auth": {
        "type": "bearer",
        "token": "CTX7-UPSTASH-REPLACE_ME"             // <- store securely, don't paste raw in shared repos
      },
      "trusted": true
    }
  ]
}
```

### Install steps (Cursor)

1. Create `~/.cursor/mcp.json` (or `.cursor/mcp.json` inside project).
2. Paste the JSON above, substituting the `url` and `token`.
3. Restart Cursor (or reload the editor).
4. In Cursor, open the MCP Directory / Composer and **install** or enable *Context7-Upstash*. Cursor docs show this flow and the recommended snippet. ([Cursor][5])

### Verification

* In Cursor, open Composer, invoke `Add MCP server` → choose `Context7-Upstash`, then test: ask Cursor to `Search Context7 for "n8n node HTTP Request"`. Cursor will return doc snippets if config is correct. ([Cursor][5])

---

# 2) VS Code + GitHub Copilot — Context7 configuration

### Why this matters

VS Code / Copilot allow MCP servers via `mcp.json` and have workspace/user locations for configuration; enterprise admin policies can restrict MCP servers, so check settings first. ([Visual Studio Code][6])

### Where to put the config

Common locations (pick one):

* User: `%USERPROFILE%\.mcp.json` (Windows) or `~/.mcp.json` (Linux/macOS)
* Workspace: `.vscode/mcp.json` or project root `.mcp.json` (recommended for repo-scoped server lists). ([Microsoft Learn][7])

### Example `.mcp.json` for VS Code (project-level)

```json
{
  "servers": [
    {
      "name": "context7-upstash",
      "url": "https://mcp.context7.upstash.io",
      "transport": "http",
      "auth": {
        "type": "bearer",
        "token": "${env:CTX7_UPSTASH_TOKEN}"
      },
      "description": "Context7 (Upstash) - n8n docs"
    }
  ],
  "toolsets": []
}
```

**Notes:**

* Use environment variables (e.g., `CTX7_UPSTASH_TOKEN`) rather than in-file tokens. VS Code/ Copilot will expand environment variables. ([Visual Studio Code][6])

### VS Code settings & security

1. In VS Code user settings, check `chat.mcp.access` — valid values: `all`, `registry`, `none`. If org policy restricts MCP servers, set it appropriately or ask admin to whitelist the server. ([Visual Studio Code][6])
2. If your org uses GitHub Copilot policies, confirm MCP servers are allowed by policy. ([GitHub Docs][8])

### Verification

* Open Copilot Chat in VS Code, select the tool picker → add MCP server (it will read your workspace `.mcp.json`).
* Test prompt inside Copilot Chat: `Using the Context7 MCP server, search for "n8n credentials http node" and return the exact doc path.` If you get doc links/snippets, config is good. ([Visual Studio Code][6])

---

# 3) Claude Code (CLI) — Context7 configuration

### Why this matters

Claude Code (Anthropic) supports remote MCP servers and has docs showing how to connect to MCP servers via the CLI. Anthropic also announced remote MCP support and a dedicated MCP docs page for Claude Code. ([Claude Docs][9])

### Typical approaches

* **Direct CLI config**: add MCP server entry to Claude Code’s config (e.g., `~/.clauderc` or its mcp config file).
* **Helper utilities**: community tools/CLIs exist that scaffold MCP config for Claude Code (search for `claude-code-mcp-init` on GitHub) — helpful for multi-tool setups. ([Reddit][10])

### Example `claude-code-mcp.json` snippet (conceptual)

```json
{
  "mcp_servers": [
    {
      "name": "context7-upstash",
      "url": "https://mcp.context7.upstash.io",
      "transport": "http",
      "auth": {
        "type": "bearer",
        "token": "CTX7-UPSTASH-REPLACE_ME"
      },
      "trusted": true
    }
  ]
}
```

(Place this where Claude Code expects MCP config — check `claude code` docs for your installed version.) ([Claude Docs][9])

### CLI commands / flow (example)

1. Set environment variable (safer):

   ```bash
   export CTX7_UPSTASH_TOKEN="...secret..."
   ```
2. Add MCP server via your Claude Code config (or use a helper script such as `claude-mcp configure` from community tools to scaffold config quickly). ([Reddit][10])
3. Run a test:

   ```bash
   claude code --mcp=context7-upstash "Search Context7 for 'n8n HTTP Request node' and return the doc path"
   ```

### Verification

* Claude Code will use the MCP server to fetch tool/doc snippets. If you see doc excerpts and file links from n8n docs, the config is successful. ([Claude Docs][9])

---

# Security, best practices & production cautions (must-read)

* **Never** store production API keys/credentials inside MCP server docs or un-vaulted JSON files. Use secrets/vault integration or ephemeral tokens.
* When giving an LLM agent access to MCP, **limit scope**: only the doc trees required (n8n docs path) and mark the server as non-privileged if possible.
* **Audit logs**: enable server-side access logs (Context7 / Upstash provides logs) to track what the agent requested. ([Upstash: Serverless Data Platform][2])
* Validate ANY auto-generated workflow in a sandbox before promoting to production.

---

# MCP prompt template — ask the agent to fetch **n8n** docs then produce a JSON workflow

> This is an MCP-aware prompt. It uses the MCP `context7` tool name (adjust to match the server name you configured in the MCP client, e.g., `Context7-Upstash`).

```text
SYSTEM: Use the MCP tool named "context7" to fetch authoritative, versioned n8n documentation. Target docs for n8n version: <TARGET_N8N_VERSION>. Only use direct doc snippets and links returned by the MCP server — never rely on model memory for API signatures. If the MCP server returns multiple candidate pages, choose the page that exactly matches the node or endpoint signature.

TASK:
1) Using MCP tool "context7", find the n8n docs for:
   - "n8n workflow JSON import format" 
   - "HTTP Request node" 
   - "Credentials configuration" 
   - "Slack node" 
   - "Authentication and best practices for nodes that use API keys"

2) Summarize (1–2 short bullets each) the exact parameter names and required fields for these pages. For any parameter that requires a credential, show the doc path and the exact parameter key names.

3) Using only the doc details found in step (1), generate a complete **n8n workflow export JSON** (the exact n8n import format) that implements this automation in staging:
   - Trigger: HTTP Request that receives POST JSON payload `{ "issue_key": "...", "summary": "...", "description":"..." }`
   - Action 1: Post a formatted message to Slack (channel: `#dev-ops`) using Slack node; use a credential placeholder (Slack_Cred_ID) and document how to set that credential in n8n.
   - Action 2: Create a Trello card in board `Automation` using Trello node; use a credential placeholder (Trello_Cred_ID) and show required field names.
   - The exported JSON must include node `credentials` fields as placeholders (not real secrets) and must be valid for importing into n8n v<TARGET_N8N_VERSION>.

4) Provide a small test plan of 3 test cases (inputs + expected Slack message text + expected Trello card fields) to validate the workflow in staging.

CONSTRAINTS:
- Only use doc snippets and file paths returned by MCP for any API signatures or parameter names; include the doc paths inline as comments in the generated JSON or immediately after the JSON as references.
- Do not hardcode any real API keys; use placeholders like `{{SLACK_CRED_ID}}`.
- If the MCP server cannot return required pages or returns contradictory signatures, stop and list exactly which page(s) are missing.

END
```

**How to invoke this prompt**

* **Cursor:** open Composer, set the current toolset to include `Context7-Upstash`, paste the prompt and run. Cursor will call MCP and can stream doc snippets. ([Cursor][5])
* **VS Code Copilot Chat:** open Copilot Chat, confirm `.mcp.json` is loaded, paste prompt. Copilot will call configured MCP servers and fetch docs. ([Visual Studio Code][6])
* **Claude Code CLI:** run `claude code` with the above prompt and `--mcp=context7-upstash` (or via configured server name). ([Claude Docs][9])

---

# Example output — a realistic n8n workflow JSON artifact

Below is a **complete n8n workflow JSON** for the example automation in the prompt (HTTP trigger → Slack → Trello). This is a **sample** you can import into n8n (staging) to test. Replace credential placeholders with actual credential IDs in your n8n instance.

> NOTE: n8n export format varies slightly between versions. This example follows the common n8n export shape (nodes + connections + credentials placeholders). Adjust `n8nVersion` and node fields as needed for your target version. If you used the MCP prompt above, the agent should produce a version-locked JSON using the exact field names from the docs it fetched.

```json
{
  "name": "Issue -> Slack + Trello (staging)",
  "nodes": [
    {
      "parameters": {
        "httpMethod": "POST",
        "path": "webhook/new-issue",
        "responseMode": "onReceived",
        "responseData": "successText",
        "responseCode": 200,
        "responseBody": "Received"
      },
      "name": "HTTP Trigger",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 1,
      "position": [250, 300],
      "credentials": {}
    },
    {
      "parameters": {
        "channel": "#dev-ops",
        "text": "=New issue created: *{{$json[\"issue_key\"]}}*\\n*Summary:* {{$json[\"summary\"]}}\\n*Description:* {{$json[\"description\"]}}"
      },
      "name": "Slack Post",
      "type": "n8n-nodes-base.slack",
      "typeVersion": 1,
      "position": [600, 200],
      "credentials": {
        "slackApi": "SLACK_CRED_ID" 
      }
    },
    {
      "parameters": {
        "boardId": "Automation", 
        "listId": "To Do",
        "name": "={{$json[\"issue_key\"]}} - {{$json[\"summary\"]}}",
        "description": "={{$json[\"description\"]}}"
      },
      "name": "Trello Create Card",
      "type": "n8n-nodes-base.trello",
      "typeVersion": 1,
      "position": [600, 400],
      "credentials": {
        "trelloApi": "TRELLO_CRED_ID"
      }
    }
  ],
  "connections": {
    "HTTP Trigger": {
      "main": [
        [
          {
            "node": "Slack Post",
            "type": "main",
            "index": 0
          },
          {
            "node": "Trello Create Card",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  },
  "active": false,
  "settings": {},
  "versionId": "1",
  "workflowId": "example-issue-to-slack-trello",
  "n8nVersion": ">=0.280.0"
}
```

### Where the placeholders map to docs (example references)

* Slack node credential field: `slackApi` — see n8n Slack node docs for the exact credential key name and how to create an OAuth token credential in n8n. *(Agent should reference the Context7 doc path it pulled for Slack node credentials.)*
* Trello node fields: `boardId`, `listId` and card fields — verify with the Trello node doc page the exact parameter names.
* Webhook node path & response options: verify `path`, `responseMode`, `responseBody` fields from the n8n webhook node docs.

> When you run the MCP prompt above, the agent will include the exact doc URLs/paths returned by Context7 inline with the JSON or immediately after it (per constraints). Use those doc references to confirm fields and types before running.

---

# 3 quick test cases (as requested in the MCP prompt)

1. **Happy path**

   * Input POST to `/webhook/new-issue` with body: `{"issue_key":"PROJ-123","summary":"Payment error","description":"Customer can't checkout"}`
   * Expected Slack: message in `#dev-ops`: `New issue created: *PROJ-123* ...`
   * Expected Trello: new card titled `PROJ-123 - Payment error`, description as supplied.

2. **Missing fields**

   * Input POST with only `{"issue_key":"PROJ-124"}`
   * Expected Slack: message containing issue_key and blank or fallback summary/description (the JSON template will render blanks)
   * Expected Trello: card name `PROJ-124 - ` (empty summary) — validate that the workflow handles missing fields or add a Set node to supply defaults.

3. **Invalid payload**

   * Non-JSON body (e.g., text) — expected: HTTP Trigger returns `400` or a handled error per your webhook node config; Slack/Trello should **not** be invoked. (Add validation logic in workflow if required.)

---

# Validation checklist (before production)

* [ ] Replace `SLACK_CRED_ID` and `TRELLO_CRED_ID` with actual credential ids created in n8n.
* [ ] Import workflow JSON into a staging n8n instance and test the three cases above.
* [ ] Confirm agent-supplied doc paths from Context7 match the version of n8n you run. If not, re-run the prompt with the precise n8n semver.
* [ ] Audit logs for MCP server usage and restrict Context7 to only needed doc paths if possible. ([Upstash: Serverless Data Platform][2])

---

# Troubleshooting (quick)

* **No docs returned:** confirm Context7 URL & token, that the server actually has n8n docs indexed (Context7 can be configured to sync specific repos/paths). If using hosted Upstash Context7, confirm your plan and the docs it includes. ([Upstash: Serverless Data Platform][2])
* **Copilot won’t load MCP server:** check `chat.mcp.access` setting in VS Code and organization Copilot policy. ([Visual Studio Code][6])
* **Cursor shows a one-click install:** Cursor offers an MCP directory and can install Context7 via the Composer UI — use that if available. ([Cursor][5])

---

# Quick next steps I can do for you right now (pick one)

1. **Generate a version-locked n8n JSON** for a specific n8n version you tell me (I’ll produce JSON adjusted to vX.Y.Z).
2. **Produce the exact Cursor / VS Code / Claude command lines** to install Context7 on your machine (I’ll include terminal commands and exact file paths).
3. **Walk through importing the included JSON into n8n (staging)** and provide step-by-step test run screenshots/commands (I’ll give the manual steps and sample curl test invocations).

Which of the three would you like me to do now? (No waiting — I’ll produce it immediately.)

[1]: https://github.com/upstash/context7?utm_source=chatgpt.com "Context7 MCP Server -- Up-to-date code documentation for ..."
[2]: https://upstash.com/blog/context7-mcp?utm_source=chatgpt.com "Context7 MCP: Up-to-Date Docs for Any Cursor Prompt"
[3]: https://www.npmjs.com/package/%40upstash/context7-mcp/v/1.0.1-rc?utm_source=chatgpt.com "upstash/context7-mcp"
[4]: https://cursor.com/docs/context/mcp?utm_source=chatgpt.com "Model Context Protocol (MCP) | Cursor Docs"
[5]: https://cursor.com/docs/context/mcp/directory?utm_source=chatgpt.com "MCP Directory | Cursor Docs"
[6]: https://code.visualstudio.com/docs/copilot/customization/mcp-servers?utm_source=chatgpt.com "Use MCP servers in VS Code"
[7]: https://learn.microsoft.com/en-us/visualstudio/ide/mcp-servers?view=vs-2022&utm_source=chatgpt.com "Use MCP Servers - Visual Studio (Windows)"
[8]: https://docs.github.com/copilot/customizing-copilot/using-model-context-protocol/extending-copilot-chat-with-mcp?utm_source=chatgpt.com "Extending GitHub Copilot Chat with the Model Context ..."
[9]: https://docs.claude.com/en/docs/claude-code/mcp?utm_source=chatgpt.com "Connect Claude Code to tools via MCP"
[10]: https://www.reddit.com/r/ClaudeAI/comments/1ls7mw3/sick_of_mcp_setup_for_claude_code_this_cli_saved/?utm_source=chatgpt.com "Sick of MCP setup for Claude Code? This CLI saved me ..."

---

https://chatgpt.com/share/68f1d1a9-d8d4-8013-a364-841880a7c23a
