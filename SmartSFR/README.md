# SmartSFR – Backend Service

FastAPI-powered calculation and data processing backend for **SmartSFR (Student–Faculty Ratio Analysis & NBA Accreditation Support System)**.

---

## Overview

The `SmartSFR` service processes institutional student enrollment and faculty roster CSV files, validates required attributes according to **NBA Chapter 4 (Section 4.1)** guidelines, computes annual and three-year average SFR metrics, and returns structured analysis payloads.

---

## Features

- **FastAPI REST API**: High-performance asynchronous API endpoints with auto-generated OpenAPI/Swagger documentation.
- **Multipart CSV Upload**: Validates required schema, non-empty files, and tabular data integrity.
- **NBA Calculation Engine**:
  - Excludes first-year UG students ($S = \text{UG2} + \text{UG3} + \text{UG4} + \text{PG1} + \text{PG2}$).
  - Evaluates faculty eligibility (Full-time, Non-FY, Regular/Contractual).
  - Annotates ineligibility reasons for excluded faculty.
  - Computes yearly SFR and 3-year arithmetic mean.
  - Applies NBA marks criteria ($\le 15 \to 15$ down to $> 25 \to 0$).
- **Built-in Sample Dataset API**: Allows immediate previewing with bundled CSV datasets.
- **Comprehensive Unit & Integration Test Suites**: Built with Python `unittest`.

---

## Directory Structure

```text
SmartSFR/
├── app.py                      # FastAPI application, CORS, and endpoints
├── requirements.txt            # Python dependencies
├── README.md                   # Backend documentation
├── test_sfr.py                 # Baseline sample calculation script
├── test_comprehensive.py       # Comprehensive unit & edge-case test suite
├── test_api_integration.py     # API upload & error handling integration tests
├── raw/
│   ├── dummy_student_data.csv  # 15-row sample student dataset (CAY, CAYm1, CAYm2)
│   └── dummy_faculty_data.csv  # 11-row sample faculty dataset
├── processed/                  # Generated files directory
└── src/
    ├── __init__.py
    ├── decision_engine.py
    ├── nba_rules.py            # NBA Section 4.1 mathematical formulas
    ├── prediction.py
    ├── preprocessing.py
    └── sfr_calculator.py       # Year-wise & 3-year SFR computation logic
```

---

## Setup & Running

1. Activate the Python virtual environment:
   * **Windows (PowerShell)**:
     ```powershell
     .\venv\Scripts\Activate.ps1
     ```
   * **Linux/macOS**:
     ```bash
     source venv/bin/activate
     ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Launch the API server:
   ```bash
   uvicorn app:app --reload --port 8000
   ```
   * Server URL: `http://127.0.0.1:8000`
   * Interactive Swagger Docs: `http://127.0.0.1:8000/docs`

---

## API Endpoints

- `GET /`: Health check & API root.
- `GET /health`: Health status endpoint (`{"status": "ok"}`).
- `GET /sample-analysis`: Returns computed SFR analysis using the bundled raw sample datasets.
- `POST /analyze`: Multipart form upload endpoint expecting `student_file` and `faculty_file`.

---

## Running Backend Tests

```bash
# Unit & edge case test suite
python test_comprehensive.py

# API integration test suite
python test_api_integration.py

# Console SFR calculation script
python test_sfr.py
```
