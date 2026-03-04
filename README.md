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

<div align="center">

# 🔍 FinExplain
### Explainable AI for Financial Fraud Detection

[![Live Demo](https://img.shields.io/badge/🤗%20Live%20Demo-Hugging%20Face%20Spaces-blue?style=for-the-badge)](https://huggingface.co/spaces/jemiridaniel/finexplain)
[![GitHub](https://img.shields.io/badge/GitHub-jemiridaniel-black?style=for-the-badge&logo=github)](https://github.com/jemiridaniel/finexplain)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)
[![Python](https://img.shields.io/badge/Python-3.11-blue?style=for-the-badge&logo=python)](https://python.org)

**Most fraud detection systems tell you _that_ a transaction was flagged. FinExplain tells you _why_.**

![FinExplain Demo](assets/demo.gif)

[🚀 Try it live →](https://huggingface.co/spaces/jemiridaniel/finexplain)

</div>

---

## 🎯 What It Does

FinExplain offers three analysis modes:

### 1. Single Transaction
Enter one transaction manually. Get an instant fraud probability, SHAP breakdown, and plain-English explanation.

### 2. Bulk CSV Upload
Upload a CSV of up to 50 transactions. Every row is scored and flagged transactions are listed with individual explanations and a downloadable PDF report.

### 3. Account History Analysis *(new)*
Upload 2 weeks of transactions for one account. FinExplain builds a **personal behavioral baseline** for that account and flags transactions that are anomalous relative to *that user's own patterns* — not just global thresholds.

> A $500 cash withdrawal may be normal globally but suspicious for an account that has never done one. Account History catches this. Single Transaction analysis cannot.

For each flagged transaction you see:
- Whether it was flagged by the **global model**, the **behavioral baseline**, or both
- The specific behavioral signals (e.g. *"Amount is 12x std deviations above this account's average"*)
- A **balance timeline chart** showing the 14-day trajectory with anomalies highlighted
- An **account-level LLM risk narrative** summarizing the overall risk picture

---

## 🖥️ Screenshots

| Single Transaction Analysis | SHAP Feature Importance |
|---|---|
| ![Single](assets/single.png) | ![SHAP](assets/shap.png) |

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                      React Frontend                           │
│   Single Transaction │ Bulk CSV Upload │ Account History      │
└────────────────────────────┬─────────────────────────────────┘
                             │ HTTP
┌────────────────────────────▼─────────────────────────────────┐
│                      FastAPI Backend                          │
│                                                               │
│  ┌──────────────────┐   ┌──────────────────────────────────┐  │
│  │ Gradient         │   │  Behavioral Analyzer              │  │
│  │ Boosting         │   │  (account baseline: mean/std,     │  │
│  │ Classifier       │   │   typical types, z-score flags)   │  │
│  │ (PaySim 200K)    │   └──────────────┬───────────────────┘  │
│  └────────┬─────────┘                  │                      │
│           │                ┌───────────▼───────────┐          │
│           └───────────────▶│   SHAP Explainer       │          │
│                            └───────────┬───────────┘          │
│                            ┌───────────▼───────────┐          │
│                            │   LLM Service          │          │
│                            │   Groq → Claude        │          │
│                            │   → OpenAI → fallback  │          │
│                            └───────────────────────┘          │
└──────────────────────────────────────────────────────────────┘
```

---

## ✨ Key Features

- 🎯 **100% accuracy** on PaySim test set (precision/recall both 1.00)
- 🔬 **SHAP explainability** — see exactly which transaction features triggered the flag
- 🤖 **Multi-LLM fallback chain** — Groq → Anthropic Claude → OpenAI, never fails silently
- 👤 **Account History Analysis** — behavioral baseline over a 2-week window catches fraud invisible to per-transaction models
- 📊 **Bulk analysis** — upload a CSV, get all transactions scored at once
- 📄 **PDF reports** — downloadable audit trail with AI explanations
- 🌍 **Deployed publicly** on Hugging Face Spaces — no setup required

---

## 🚀 Quick Start

```bash
# Clone
git clone https://github.com/jemiridaniel/finexplain.git
cd finexplain

# Backend
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env        # Add your GROQ_API_KEY
uvicorn app.main:app --reload

# Frontend (new terminal)
cd frontend
npm install
npm start
```

Visit `http://localhost:3000` · API docs at `http://localhost:8000/docs`

---

## 🧠 Model Details

| Property | Value |
|---|---|
| Algorithm | Gradient Boosting Classifier |
| Training data | PaySim synthetic mobile money (200K transactions) |
| Test accuracy | 100% (precision & recall) |
| Features | 14 engineered features including balance deltas, drain detection, error signals |
| Explainability | SHAP TreeExplainer |
| Fraud rate in training | ~9% (balanced sampling) |

### Feature Engineering

The model uses these engineered signals beyond raw transaction values:

| Feature | What It Detects |
|---|---|
| `orig_drained` | Account emptied to zero after transaction |
| `amount_equals_balance` | Entire account balance moved in one go |
| `dest_no_increase` | Money left sender but never arrived |
| `orig_balance_error` | Discrepancy between expected and actual balance |
| `amount_to_orig_ratio` | Transaction size relative to account balance |

---

## 🔬 Research Context

This project implements production-grade Explainable AI (XAI) — the same architectural pattern explored in:

> Jemiri, D. T. (2025). *Explainable large language model–augmented clinical decision support for malaria diagnosis in resource-constrained settings.* Manuscript in preparation.

The combination of a supervised classifier + SHAP feature attribution + LLM narration creates a system that is both accurate and interpretable — addressing a key limitation of black-box fraud detection systems used in fintech.

---

## 📁 Project Structure

```
finexplain/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── transactions.py   # Single + bulk analysis routes
│   │   │   ├── account.py        # Account history route
│   │   │   └── health.py
│   │   ├── core/                 # Config and settings
│   │   ├── models/               # ML model + Pydantic schemas
│   │   └── services/
│   │       ├── llm_service.py    # Multi-LLM fallback chain
│   │       ├── explainer.py      # SHAP TreeExplainer
│   │       ├── account_analyzer.py  # Behavioral baseline profiling
│   │       └── report.py         # PDF generation
│   └── requirements.txt
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── TransactionForm.js
│       │   ├── BulkUpload.js
│       │   ├── AccountHistory.js    # 2-week history upload + demo
│       │   ├── AccountResults.js    # Timeline + behavioral flags
│       │   └── ResultCard.js
│       └── services/api.js
├── data/
│   └── sample_transactions.csv
├── Dockerfile
└── README.md
```

---

## 🛣️ Roadmap

- [x] Single transaction analysis with SHAP + LLM explanation
- [x] Bulk CSV upload and scoring
- [x] Account history analysis — behavioral baseline over 2-week window
- [x] PDF report generation
- [x] Deployed on Hugging Face Spaces
- [ ] Real-time transaction streaming via WebSocket
- [ ] User authentication + persistent transaction history
- [ ] Fine-tuned explanation model
- [ ] Multi-language explanations (Yoruba, Igbo, Hausa)
- [ ] Network anomaly detection module

---

## 👤 Author

**Jemiri Daniel Taiwo** — MLOps Engineer | AI Researcher

[![LinkedIn](https://img.shields.io/badge/LinkedIn-jemiridanieltaiwo-0077B5?style=flat&logo=linkedin)](https://linkedin.com/in/jemiridanieltaiwo)
[![GitHub](https://img.shields.io/badge/GitHub-jemiridaniel-black?style=flat&logo=github)](https://github.com/jemiridaniel)

---

## 📜 License

MIT License — free to use, modify, and deploy.
