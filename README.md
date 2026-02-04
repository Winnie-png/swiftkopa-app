# SwiftKopa 🇰🇪

A lightweight credit-scoring and lending MVP designed for the Kenyan market. This project focuses on solving the "trust gap" in micro-lending through automated data orchestration.

### 🚀 Current Status: MVP (v1.0)
* **Logic Engine:** Google Apps Script (GAS) for rapid prototyping and spreadsheet-based ledger management.
* **Frontend:** React + Tailwind (Lovable).
* **Database:** Google Sheets (serving as a lightweight relational DB for version 1).

### 🛠️ Key Technical Challenges Solved
* **Interest Logic:** Implemented automated repayment schedules and late-fee triggers.
* **Security:** Enforced Google Cloud API restrictions and HTTP referrer validation.

### 📅 Roadmap (Next Steps)
* **Database Migration:** Moving from Sheets to **Supabase (PostgreSQL)** to handle concurrent transactions.
* **M-Pesa C2B/B2C:** Integrating Daraja API for automated disbursements and reconciliations.
