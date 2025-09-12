https://raw.githubusercontent.com/nordeim/misc/refs/heads/main/Python%20Envronments/Conda_vs_uv.png

https://raw.githubusercontent.com/nordeim/misc/refs/heads/main/Python%20Envronments/Tool%20Selection%20Matrix.png

---

### 🔍 What This Chart Covers

#### **Tool Selection Matrix**
- Compares **Conda**, **pip**, **uv**, and **Poetry** across:
  - Environment management
  - Support for non-Python packages
  - Suitability for web APIs/scripts
  - Speed of installation
  - Reproducibility

#### **Workflow Recommendations**
- Shows ideal stacks for:
  - **ML pipelines** → Conda + pip or Poetry (for native libs + reproducibility)
  - **FastAPI apps** → uv + venv + uvicorn (for speed + async support)
  - **LLM training environments** → Conda (for CUDA, PyTorch) + Poetry or uv (for reproducible installs)

---

https://copilot.microsoft.com/shares/d33PY15yipRNDFxLV8yGn
