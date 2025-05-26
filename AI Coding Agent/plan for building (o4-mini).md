## 🚀 Phase 1: Project Initialization

1. Create a Git repo & basic scaffolding  
   ```bash
   mkdir codenav-cli && cd codenav-cli
   git init
   ```
2. Pick your tech stack  
   - **Language**: Python 3.10+ (rich ecosystem for CLI & LLM APIs)  
   - **CLI framework**: [Typer](https://typer.tiangolo.com/) or Click  
   - **Dependency management**: Poetry or pip + `venv`  
3. Install core dependencies  
   ```bash
   poetry init -n
   poetry add typer[all] openai gitpython sqlite-utils rich pytest
   ```
4. Establish directory layout  
   ```
   codenav-cli/
   ├─ codenav/
   │   ├─ __init__.py
   │   ├─ cli.py
   │   ├─ llm_client.py
   │   ├─ indexer.py
   │   ├─ search.py
   │   ├─ planner.py
   │   ├─ patcher.py
   │   ├─ tester.py
   │   └─ utils/
   ├─ prompts/
   │   └─ system_prompt.txt
   ├─ tests/
   ├─ pyproject.toml
   └─ README.md
   ```

---

## 🧩 Phase 2: LLM Client & System Prompt

1. **Store** your refined System Prompt in `prompts/system_prompt.txt`.  
2. Implement `llm_client.py`  
   - Wrap OpenAI (or Claude) API calls  
   - Load system prompt once; append user messages  
   - Expose `chat(messages: List[dict]) → dict`
   ```python
   from openai import OpenAI
   class LLMClient:
       def __init__(self, api_key, model="gpt-4"):
           self.client = OpenAI(api_key=api_key)
           self.system_prompt = Path("prompts/system_prompt.txt").read_text()
       def chat(self, user_msgs):
           full_msgs = [{"role":"system","content":self.system_prompt}] + user_msgs
           return self.client.chat.create(model=self.model, messages=full_msgs)
   ```
3. Write **unit tests** to mock API calls and verify prompt inclusion.

---

## 🔍 Phase 3: Project Onboarding & Indexing

1. **Indexer** (`indexer.py`):  
   - Recursively scan project folder  
   - Record each file’s path, language, LOC count  
   - Extract symbols (functions, classes) via simple regex or `ast` for Python  
   - Store into a lightweight SQLite DB (`sqlite-utils` makes this trivial)  
2. **Dependency Graph**:  
   - For Python: parse `import` statements  
   - Save edges (module → imported module) into DB  
3. **Project Summary**:  
   - Query DB to compute:
     - Total files / LOC  
     - Top-3 largest files  
     - Modules with most imports  
   - Store summary in memory for quick reuse  
4. Expose an **onboard** function:
   ```bash
   codenav onboard /path/to/project
   ```
   - Reports “Index built in X ms, Y files, summary: …”

---

## 🔎 Phase 4: Task Intake & Semantic Search

1. **CLI command** (`cli.py`):
   ```bash
   codenav diagnose --type bug --description "NullPointer at X"
   ```
2. **Search module** (`search.py`):  
   - Keyword + fuzzy search over indexed symbols & file contents  
   - Return top-5 candidate files/snippets  
3. Gather user-provided context (logs, stack traces)  
4. Bundle these into a **user prompt** for the LLM:  
   ```json
   [
     {"role":"user","content":"Task: Diagnose bug ‘…’\nCandidates:\n- file1.py: …\n- file2.py: …"}
   ]
   ```
5. Call `llm_client.chat(...)` → get hypotheses & impact assessment

---

## 🧠 Phase 5: Solution Strategy & Planning

1. **Planner** (`planner.py`):
   - Parse LLM’s 2–3 candidate approaches  
   - Format into human-readable Markdown with pros/cons  
   - Ask the user to “Choose preferred approach (1/2/3) or ask Q”
2. Once chosen, ask LLM for a **Step-by-Step Implementation Plan**  
3. Store plan in a structured object:
   ```python
   {
     "steps": [
       {"goal": "...", "files": [...], "diff": "...", "notes": "..."},
       …
     ],
     "checklist": [...]
   }
   ```

---

## 🛠 Phase 6: Patch Generation & Testing

1. **Patcher** (`patcher.py`):
   - Take each “step.diff” and apply via `git apply --index`  
   - Stage changes atomically  
2. **Tester** (`tester.py`):
   - Auto-run existing test suite (`pytest`)  
   - Optionally generate new tests by prompting LLM:  
     > “Write a pytest for function foo() covering edge case X.”
3. Summarize results (passed/failed/new coverage) via **Rich** tables

---

## 📜 Phase 7: CLI Experience & Workflow

1. Commands overview  
   ```bash
   codenav onboard [dir]       # build index
   codenav diagnose [options]  # analyze bug/feature
   codenav plan                # review & choose approach
   codenav apply               # apply patches + run tests
   codenav status              # view current index & summary
   ```
2. Interactive mode (`codenav shell`)  
   - A REPL where you can type Pandora-style queries:  
     > `> show deps for module user.py`  
   - Implement via Typer’s `@app.command()(incomplete=False)`

---

## ✅ Phase 8: Validation, CI & Packaging

1. Write **unit tests** for each module (`pytest`)  
2. Set up **GitHub Actions** for  
   - Linting (`flake8`, `black`)  
   - Unit tests  
   - Example end-to-end on a toy repo  
3. Package for pip:  
   - `poetry build && poetry publish`  
   - Add console-script entry point in `pyproject.toml`

---

## 📘 Phase 9: Documentation & Examples

1. **README.md** with  
   - Quick-start guide  
   - Example session transcript  
2. **sample-repo/**  
   - A tiny demo project to show indexing, diagnosing, patching  
3. **Troubleshooting** section  
   - Common pitfalls & how to fix (API keys, rate limits)

---

## 🎯 Expected Outcome

By following this plan, you’ll ship **CodeNav-CLI** that:

- Onboards any codebase & keeps a live semantic index  
- Lets users issue “diagnose → plan → apply → test” flows  
- Generates minimal, tested, diff-style patches  
- Uses your **powerful system prompt** to guide the LLM  
- Offers a smooth, Git-centric, CLI-first experience  
