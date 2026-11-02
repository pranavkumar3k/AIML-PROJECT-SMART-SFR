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
  - Evaluates faculty eligibility independently for CAY, CAYm1, and CAYm2 using joining/leaving dates, full-time status, first-year assignment, and association.
  - Returns each faculty record's eligibility status, dates, and exclusion reasons.
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

### Faculty eligibility and CSV format

The faculty CSV requires `joining_date` and `leaving_date` in `YYYY-MM-DD` format. A blank leaving date means currently employed. CAY is the current academic year using the August 1 boundary; CAYm1 and CAYm2 are the preceding two academic years. Each period runs from August 1 through June 30 of the following year. To count toward F, faculty must be full-time, not dedicated to first-year students, associated as Regular or Contractual, have joined on or before August 1, and not have left before June 1. Joining on August 1 and leaving on or after June 1 meet the date criteria. Invalid or missing dates and leaving dates earlier than joining dates appear as exclusion reasons.

```csv
academic_year,faculty_id,designation,association,full_time,first_year_faculty,joining_date,leaving_date
CAY,F001,Assistant Professor,Regular,Yes,No,2023-07-15,
CAY,F002,Assistant Professor,Regular,Yes,No,2024-09-10,
CAY,F003,Associate Professor,Regular,Yes,No,2023-06-01,2025-05-15
CAY,F004,Assistant Professor,Contractual,Yes,No,2023-08-01,
```

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
