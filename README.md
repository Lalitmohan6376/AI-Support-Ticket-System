# AI Support Ticket Triage & Classification System

An enterprise-grade intelligent support operations platform featuring deep learning text classification, automated priority scoring, spam defense screening, and real-time queue management.

---

## Architecture Overview

```text
User Portal (React)  --->  Flask REST API  --->  BiLSTM & ML Pipeline  --->  Operations Dashboard
                                                      |
                                           +----------+----------+
                                           |                     |
                                    Neural Models         Security Filter
                                (Category & Priority)     (Spam Quarantine)
```

---

## Key Features

* **Multi-Class Category Classification**: Deep BiLSTM model trained on support ticket semantics (Billing, Cancellation, Product, Refund, Technical Support).
* **Automated Priority Assessment**: BiLSTM sequence classifier predicting ticket urgency (`high`, `medium`, `low`).
* **Security & Spam Screening**: Naive Bayes + TF-IDF gatekeeper filtering phishing and malicious content into quarantine.
* **Customer Satisfaction (CSAT) Scoring**: Regression model predicting customer sentiment rating (1-5 stars).
* **Real-time Operations Dashboard**: Clean staff console with live workload KPIs, search, filtering, and instant status updates.
* **OTP Authentication**: Whitelist-protected email verification protocol for authorized personnel.

---

## Tech Stack

* **Frontend**: React, Vite, Lucide Icons, Modern CSS Modules
* **Backend**: Python, Flask, Flask-CORS, PyMySQL, SMTPLib
* **Machine Learning**: TensorFlow, Keras, Scikit-learn, Joblib
* **Database**: MySQL

---

## Directory Structure

```text
AI-Support-Ticket-System/
├── backend/
│   ├── routes/
│   │   └── auth_routes.py
│   ├── services/
│   │   ├── email_service.py
│   │   └── otp_service.py
│   ├── app.py
│   ├── config.py
│   ├── database.py
│   ├── model_loader.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx
│   │   │   ├── LandingPage.css
│   │   │   ├── StaffDashboard.jsx
│   │   │   ├── StaffDashboard.css
│   │   │   ├── StaffLogin.jsx
│   │   │   ├── StaffLogin.css
│   │   │   ├── UserTicketForm.jsx
│   │   │   └── UserTicketForm.css
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
├── models/
│   ├── ticket_category_bilstm.keras
│   ├── ticket_priority_bilstm.keras
│   ├── ticket_spam_detector.joblib
│   ├── customer_satisfaction_model.joblib
│   ├── priority_tokenizer.pkl
│   └── priority_label_encoder.pkl
└── README.md
```

---

## Getting Started

### 1. Backend Setup
```bash
cd backend
pip install -r requirements.txt
python app.py
```
Backend will be available on `http://localhost:8000`.

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Frontend will be available on `http://localhost:5173`.

---

## Authorized Staff Access
Authorized email accounts can log in via OTP verification or demo credentials:
* `lalitg6376@gmail.com`
* `admin@supportdesk.com` (Demo passcode: `123456`)
