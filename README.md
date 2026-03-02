# FinExplain 🔍
### Explainable AI for Financial Fraud Detection

[![Python](https://img.shields.io/badge/Python-3.10+-blue)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110-green)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18-61DAFB)](https://react.dev)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

FinExplain detects anomalous financial transactions and explains **why** they were flagged — in plain English. Most fraud detection systems are black boxes. FinExplain is not.

Built with an Isolation Forest anomaly detector, SHAP-based feature importance, and a multi-LLM explanation engine (Groq → Anthropic Claude → OpenAI fallback chain).

---

## ✨ Features

- 📤 Upload a CSV of transactions or enter one manually
- 🤖 ML model scores each transaction for anomaly likelihood
- 🔍 SHAP values explain which features drove the decision
- 💬 LLM generates a plain-English explanation for each flagged transaction
- 🔄 Multi-LLM fallback: Groq → Claude → OpenAI (never fails silently)
- 📄 Download a full PDF report of flagged transactions
- 🌍 Deployable to Hugging Face Spaces (free)

---

## 🏗️ Architecture

```
finexplain/
├── backend/                  # FastAPI application
│   ├── app/
│   │   ├── api/              # Route handlers
│   │   ├── core/             # Config, settings
│   │   ├── models/           # ML model logic
│   │   └── services/         # LLM service, SHAP service
│   └── tests/
├── frontend/                 # React application
│   └── src/
│       ├── components/       # Reusable UI components
│       ├── pages/            # App pages
│       └── services/         # API client
├── data/                     # Sample datasets
├── notebooks/                # EDA and model training notebooks
└── .github/workflows/        # CI/CD
```

---

## 🚀 Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+
- API keys: Groq (free at console.groq.com), optionally Anthropic + OpenAI

### 1. Clone the repo
```bash
git clone https://github.com/jemiridaniel/finexplain.git
cd finexplain
```

### 2. Backend setup
```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env            # Add your API keys
uvicorn app.main:app --reload
```

### 3. Frontend setup
```bash
cd frontend
npm install
npm start
```

### 4. Open the app
Visit `http://localhost:3000`

---

## 🔑 Environment Variables

```env
GROQ_API_KEY=your_groq_key
ANTHROPIC_API_KEY=your_anthropic_key      # fallback
OPENAI_API_KEY=your_openai_key            # fallback
MODEL_PATH=app/models/isolation_forest.pkl
```

---

## 📊 Dataset

This project uses the [PaySim synthetic dataset](https://www.kaggle.com/datasets/ealaxi/paysim1) — a simulation of mobile money transactions. It is publicly available on Kaggle and mirrors real-world fintech transaction patterns.

---

## 🧠 How It Works

1. **Detection** — An Isolation Forest model scores each transaction. The more anomalous, the higher the score.
2. **Explanation (SHAP)** — SHAP TreeExplainer computes feature contributions, showing which fields (amount, balance delta, transaction type) pushed the score up or down.
3. **LLM Narration** — The SHAP values + transaction details are sent to an LLM which generates a human-readable explanation. The system tries Groq first, falls back to Claude, then OpenAI.

---

## 📄 Research Context

This project is the engineering implementation of concepts explored in:

> Jemiri, D. T. (2025). *Explainable large language model–augmented clinical decision support for malaria diagnosis in resource-constrained settings.* Manuscript in preparation.

The same XAI + LLM explanation architecture applied to clinical diagnosis here is adapted for financial anomaly detection.

---

## 🛣️ Roadmap

- [ ] Real-time transaction streaming (WebSocket)
- [ ] User authentication + transaction history
- [ ] Hugging Face Spaces deployment
- [ ] Fine-tuned explanation model
- [ ] Multi-language explanations (Yoruba, Igbo, Hausa)

---

## 👤 Author

**Jemiri Daniel Taiwo** — MLOps Engineer | AI Researcher  
[LinkedIn](https://linkedin.com/in/jemiridanieltaiwo) · [GitHub](https://github.com/jemiridaniel)

---

## 📜 License

MIT License — free to use, modify, and deploy.
