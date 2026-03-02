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

Upload a CSV of financial transactions or enter one manually. FinExplain will:

1. **Score** each transaction using a Gradient Boosting classifier trained on 200,000 real PaySim transactions
2. **Explain** which features drove the decision using SHAP values (visualized as a bar chart)
3. **Narrate** the finding in plain English using an LLM — so non-technical stakeholders can act on it
4. **Report** — download a full PDF of flagged transactions with AI explanations included

---

## 🖥️ Screenshots

| Single Transaction Analysis | SHAP Feature Importance |
|---|---|
| ![Single](assets/single.png) | ![SHAP](assets/shap.png) |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│                   React Frontend                     │
│         Single Transaction │ Bulk CSV Upload         │
└──────────────────┬──────────────────────────────────┘
                   │ HTTP
┌──────────────────▼──────────────────────────────────┐
│                  FastAPI Backend                     │
│                                                      │
│  ┌─────────────────┐    ┌──────────────────────┐    │
│  │ Gradient        │    │   SHAP Explainer      │    │
│  │ Boosting        │───▶│   (feature impact)    │    │
│  │ Classifier      │    └──────────┬───────────┘    │
│  │ (PaySim 200K)   │               │                 │
│  └─────────────────┘    ┌──────────▼───────────┐    │
│                          │   LLM Service        │    │
│                          │   Groq → Claude      │    │
│                          │   → OpenAI fallback  │    │
│                          └──────────────────────┘    │
└─────────────────────────────────────────────────────┘
```

---

## ✨ Key Features

- 🎯 **100% accuracy** on PaySim test set (precision/recall both 1.00)
- 🔬 **SHAP explainability** — see exactly which transaction features triggered the flag
- 🤖 **Multi-LLM fallback chain** — Groq → Anthropic Claude → OpenAI, never fails silently
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
│   │   ├── api/            # FastAPI route handlers
│   │   ├── core/           # Config and settings
│   │   ├── models/         # ML model + Pydantic schemas
│   │   └── services/       # LLM, SHAP, PDF report
│   └── requirements.txt
├── frontend/
│   └── src/
│       ├── components/     # React UI components
│       └── services/       # API client
├── data/
│   └── sample_transactions.csv
├── Dockerfile
└── README.md
```

---

## 🛣️ Roadmap

- [ ] Real-time transaction streaming via WebSocket
- [ ] User authentication + transaction history
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
