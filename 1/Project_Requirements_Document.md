### Project Summary

This project implements a production-ready, microservices Customer Support AI Agent with a React + TypeScript frontend and a FastAPI Python backend, centered on a custom AI agent orchestrator that performs RAG, memory management, file processing, and escalation logic. The backend is documented as stable and runnable; recent logs confirm successful startup and session handling though Redis connectivity and frontend session handling need attention. The backend design and operational playbooks are detailed and emphasize modular tools, Pydantic-based configuration, Alembic migrations, ChromaDB-based vector search, and careful observability and scaling guidance.

---

### 1. WHAT — scope, core features, and components

- Purpose: enterprise AI customer support with real-time chat, document ingestion, RAG-based knowledge retrieval, persistent short-term memory, and configurable escalation to humans.
- Core components:
  - Frontend: React SPA (Vite, TypeScript, Tailwind) with WebSocket streaming and file upload UI.
  - Backend: FastAPI service, SQLAlchemy ORM, Alembic migrations, Pydantic settings, WebSocket manager, REST endpoints for sessions/messages, and middleware for timing, rate limits, and error handling.
  - AI/Tools: Custom ChatAgent orchestrator (AgentContext / AgentResponse), RAGTool (SentenceTransformers → ChromaDB), MemoryTool (SQLite/Postgres), AttachmentTool (MarkItDown), EscalationTool for human routing.
  - Infrastructure: Docker Compose stacks, Redis cache (with graceful fallback to in-memory), ChromaDB persistence, optional OpenAI/Azure LLM usage for generation.
- Operational artifacts: health endpoints, Prometheus metrics, Grafana dashboards, backup/restore scripts, and detailed run/debug commands and troubleshooting sections.

Sources: GEMINI.md; backend status and operational notes; backend briefing and component lists; architecture doc and component deep-dive; README operational & deployment guidance.

---

### 2. WHY — design rationale and intended business outcomes

- Transparency and maintainability: the project intentionally uses a custom, class-structured agent orchestrator rather than a black-box external agent framework to increase debuggability and predictable tool integration.
- Modularity for extensibility: agent tools are pluggable (BaseTool pattern), which allows adding domain-specific tools (e.g., CRM lookups, billing APIs) without changing core orchestration.
- Production readiness: emphasis on observability, DB migrations, config validation, rate limiting, and containerized deployment indicate intent for enterprise use and safe operations under load.
- Business value: faster responses, automated resolution of common queries, 24/7 availability, and quantifiable metrics (escalation rate, response accuracy) are explicit targets in docs and README use-case claims.

Key supporting citations: architecture & rationale; project overview and maintainability choice; business-value claims and monitoring guidance.

---

### 3. HOW — architecture, data flows, and key implementation choices

- Message lifecycle (high-level): frontend → REST/WebSocket → FastAPI route → CustomerSupportAgent.process_message → (1) load memory, (2) process attachments, (3) RAG search via ChromaDB, (4) escalation checks, (5) response generation, (6) store memories and emit structured AgentResponse back to client (streamed via WebSocket if configured).
- RAG implementation: documents are chunked, embedded with a SentenceTransformer model, stored in ChromaDB; query embedding → similarity search → top chunks injected as context for LLM generation.
- Memory model: conversation memories stored in DB with configurable max_history and TTL; memory retrieval influences agent prompt/context.
- Tool orchestration: agent uses explicit tool selection logic and deterministic sequence to combine tool outputs into a single AgentResponse object enabling predictable API responses and streaming tokens where needed.
- Resilience patterns:
  - Redis as primary cache with try/catch fallback to in-memory cache to keep service functioning when Redis is unavailable.
  - Pydantic Settings with validators to ensure directories and envs are present and to adapt behavior for dev/prod.
  - Alembic-based migrations for schema changes and dynamic table creation guards in initialization to avoid startup failures.

Implementation references: agent flow and tools; RAG details; resilience and config patterns; project README deployment and streaming behavior.