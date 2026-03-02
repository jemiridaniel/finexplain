---
title: FinExplain
emoji: 🔍
colorFrom: blue
colorTo: indigo
sdk: docker
pinned: false
license: mit
short_description: Explainable AI fraud detection — GBM + SHAP + LLM
---

# FinExplain 🔍
### Explainable AI for Financial Fraud Detection

[![Python](https://img.shields.io/badge/Python-3.11+-blue)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110-green)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18-61DAFB)](https://react.dev)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

FinExplain detects anomalous financial transactions and explains **why** they were flagged — in plain English. Most fraud detection systems are black boxes. FinExplain is not.

Built with a Gradient Boosting classifier, SHAP-based feature importance, and a multi-LLM explanation engine (Groq → Anthropic Claude → OpenAI fallback chain).

---

## ✨ Features

- 📤 Upload a CSV of transactions or enter one manually
- 🤖 Gradient Boosting model scores fraud probability
- 🔍 SHAP values explain which features drove the decision
- 💬 LLM generates a plain-English explanation for each flagged transaction
- 🔄 Multi-LLM fallback: Groq → Claude → OpenAI (never fails silently)
- 📄 Download a full PDF report of flagged transactions
- 🌍 Deployed to Hugging Face Spaces (Docker)

---

## 🏗️ Architecture

```
finexplain/
├── backend/                  # FastAPI application
│   ├── app/
│   │   ├── api/              # Route handlers
│   │   ├── core/             # Config, settings
│   │   ├── models/           # ML model logic + schemas
│   │   └── services/         # LLM service, SHAP explainer, PDF report
│   └── requirements.txt
├── frontend/                 # React application
│   └── src/
│       ├── components/       # TransactionForm, ResultCard, BulkUpload, etc.
│       └── services/         # Axios API client
├── data/                     # PaySim dataset (not committed)
└── Dockerfile                # Single-container deployment for HF Spaces
```

---

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- API key: Groq (free at [console.groq.com](https://console.groq.com)), optionally Anthropic + OpenAI

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
Visit `http://localhost:3001`

---

## 🔑 Environment Variables

```env
GROQ_API_KEY=your_groq_key
ANTHROPIC_API_KEY=your_anthropic_key      # fallback
OPENAI_API_KEY=your_openai_key            # fallback
MODEL_PATH=app/models/isolation_forest.pkl
ANOMALY_THRESHOLD=-0.5
```

---

## 📊 Dataset

This project uses the [PaySim synthetic dataset](https://www.kaggle.com/datasets/ealaxi/paysim1) — a simulation of mobile money transactions, publicly available on Kaggle and mirroring real-world fintech transaction patterns.

---

## 🧠 How It Works

1. **Detection** — A Gradient Boosting classifier scores each transaction with a fraud probability (0–1).
2. **Explanation (SHAP)** — SHAP TreeExplainer computes feature contributions, showing which fields (amount, balance delta, transaction type, balance errors) drove the prediction.
3. **LLM Narration** — SHAP values + transaction details are sent to an LLM which generates a human-readable explanation. The system tries Groq first, falls back to Claude, then OpenAI, then a rule-based fallback.

---

## 👤 Author

**Jemiri Daniel Taiwo** — MLOps Engineer | AI Researcher
[LinkedIn](https://linkedin.com/in/jemiridanieltaiwo) · [GitHub](https://github.com/jemiridaniel)

---

## 📜 License

MIT License — free to use, modify, and deploy.
