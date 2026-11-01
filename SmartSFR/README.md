# SmartSFR

SmartSFR is a Python-based backend for analyzing Student-Faculty Ratio (SFR) using CSV uploads. It validates institutional data, calculates SFR for the current and previous academic years, and produces the average SFR and NBA marks used in accreditation assessments.

## Overview

This project is designed for academic quality analysis, especially for NBA-style reporting. It reads:

- student data by academic year, program type, and year of study
- faculty data by academic year, designation, association, and full-time status

Then it calculates:

- yearly SFR for CAY, CAYm1, and CAYm2
- average SFR across the three years
- NBA marks based on the average SFR rules

## Features

- FastAPI backend service
- CSV upload endpoint for student and faculty data
- Required-column validation for both files
- SFR calculations aligned with NBA Section 4.1 logic
- Dummy sample datasets included for testing
- Built-in Python tests for the calculation logic

## Project Structure

```text
SmartSFR/
│
├── app.py                  # FastAPI application and API routes
├── requirements.txt        # Python dependencies
├── README.md               # Project documentation
├── test_sfr.py             # Console test script for sample calculation
├── raw/
│   ├── dummy_student_data.csv
│   └── dummy_faculty_data.csv
├── processed/
│   └── output files generated during use
└── src/
    ├── __init__.py
    ├── decision_engine.py
    ├── nba_rules.py        # NBA SFR formula and marks logic
    ├── prediction.py
    ├── preprocessing.py
    ├── sfr_calculator.py   # Main yearly and 3-year SFR calculations
    └── test_sfr.py
```

## Tech Stack

- Python 3
- FastAPI
- Pandas
- Pydantic (via FastAPI)

## Setup

1. Clone the repository.
2. Create and activate a virtual environment:

```bash
python -m venv .venv
```

On Windows PowerShell:

```powershell
.\.venv\Scripts\Activate.ps1
```

On macOS/Linux:

```bash
source .venv/bin/activate
```

3. Install dependencies:

```bash
pip install -r requirements.txt
```

## Run the App

Start the API server:

```bash
uvicorn app:app --reload
```

The API will be available at:

- http://localhost:8000
- Swagger docs: http://localhost:8000/docs

## API Endpoints

### GET /
Returns a basic health message.

### GET /health
Returns application health status.

### POST /analyze
Uploads two CSV files:

- student_file
- faculty_file

#### Request format
Use multipart form data.

#### Expected student CSV columns

```text
academic_year
program
program_type
year_of_study
student_count
```

#### Expected faculty CSV columns

```text
academic_year
faculty_id
designation
association
full_time
first_year_faculty
```

#### Example

```bash
curl -X POST "http://localhost:8000/analyze" \
  -F "student_file=@raw/dummy_student_data.csv" \
  -F "faculty_file=@raw/dummy_faculty_data.csv"
```

## Sample Output

The response contains yearly SFR information and the final average value:

```json
{
  "yearly_results": {
    "CAY": {
      "academic_year": "CAY",
      "total_students": 120,
      "faculty_count": 8,
      "sfr": 15.0
    }
  },
  "average_sfr": 14.5,
  "marks": 15
}
```

## Running the Sample Calculation

You can run the built-in sample calculation script:

```bash
python test_sfr.py
```

This reads the dummy CSV files in the raw folder and prints the SFR analysis summary to the console.

## Notes

- Student counts are grouped by academic year and study level.
- Only full-time faculty who are not first-year faculty and are in eligible associations are counted.
- The current logic follows the project’s NBA interpretation for SFR calculation and scoring.

## License

This project is for internal academic analysis and personal use unless otherwise specified.
