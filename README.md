# SmartSFR – Essential Reference & Quickstart Guide

> **Student–Faculty Ratio (SFR) Analysis and NBA Accreditation Support System**  
> Aligned with NBA Self Assessment Report (SAR) **Chapter 4, Section 4.1**.

---

## 1. Quickstart Commands

### Start Backend (`SmartSFR`)
```bash
cd SmartSFR
.\venv\Scripts\python.exe -m uvicorn app:app --reload --port 8000
```
- **API URL:** `http://127.0.0.1:8000`
- **Swagger Docs:** `http://127.0.0.1:8000/docs`

### Start Frontend (`accreditation-aid`)
```bash
cd accreditation-aid
npm run dev
```
- **Web App URL:** `http://localhost:5173`

---

## 2. NBA Section 4.1 Rules & Formulas

### Student Enrollment Formula ($S$)
$$S = UG2 + UG3 + UG4 + PG1 + PG2$$
* **First-year UG ($UG1$) is strictly excluded** because 1st-year students and faculty are evaluated under Basic Sciences & Humanities (Criterion 2).

### Faculty Eligibility Formula ($F$)
$$F = F_{Regular} + F_{Contractual}$$
* **Eligible:** Full-time departmental teaching faculty (`full_time == "Yes"` and `first_year_faculty == "No"`).
* **Excluded:** Part-time, visiting, hourly, adjunct, and first-year dedicated faculty.
* **Contractual Verification Note:** Institutional proof (open selection committee, 2 consecutive semesters, AICTE qualification norms) is required during NBA peer visits.

### Yearly SFR & 3-Year Average
$$\text{SFR} = \frac{S}{F} = \frac{\text{Total Students}}{\text{Eligible Faculty}}$$

$$\text{Average SFR} = \frac{\text{SFR}_{\text{CAY}} + \text{SFR}_{\text{CAYm1}} + \text{SFR}_{\text{CAYm2}}}{3}$$

### NBA Marks Rubric (Out of 15)
| Average SFR | NBA Marks | Status |
| :---: | :---: | :--- |
| $\le 15.0$ | **15** | Maximum Marks (Optimal) |
| $> 15.0$ and $\le 17.0$ | **14** | Compliant |
| $> 17.0$ and $\le 19.0$ | **13** | Compliant |
| $> 19.0$ and $\le 21.0$ | **12** | Compliant |
| $> 21.0$ and $\le 23.0$ | **11** | Compliant |
| $> 23.0$ and $\le 25.0$ | **10** | Minimum Passing Tier |
| $> 25.0$ | **0** | Disqualified for Section 4.1 |

---

## 3. Required CSV Column Formats

### Student CSV (`student_file.csv`)
Columns required:
```csv
academic_year,program,program_type,year_of_study,student_count
CAY,B.Tech CSE,UG,2,60
CAY,B.Tech CSE,UG,3,55
CAY,B.Tech CSE,UG,4,50
CAY,M.Tech CSE,PG,1,20
CAY,M.Tech CSE,PG,2,15
```

### Faculty CSV (`faculty_file.csv`)
Columns required:
```csv
academic_year,faculty_id,designation,association,full_time,first_year_faculty
CAY,F001,Assistant Professor,Regular,Yes,No
CAY,F002,Assistant Professor,Regular,Yes,No
CAY,F003,Associate Professor,Regular,Yes,No
CAY,F004,Assistant Professor,Contractual,Yes,No
```

---

## 4. Application Pages & Navigation

| Route | Page | Purpose |
| :--- | :--- | :--- |
| `/` | **Dashboard** | File upload, Run Analysis button, KPI cards, SFR chart, summary table |
| `/student-data` | **Student Data** | Search, filter by Year/Level, view all parsed student rows |
| `/faculty-data` | **Faculty Data** | Audit faculty roster, filter by eligibility, review NBA compliance |
| `/sfr-calculation` | **SFR Calculation** | Step-by-step mathematical breakdown for CAY, CAYm1, CAYm2 & 3-year average |
| `/reports` | **Reports** | Official NBA SAR Section 4.1 report preview, Print/PDF export, CSV/Excel export |
| `/about` | **About** | Project overview, user personas, NBA Chapter 4 methodology & rules |

---

## 5. Backend REST Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/` | Backend health & status check |
| `GET` | `/health` | Service health status (`{"status": "ok"}`) |
| `GET` | `/sample-analysis` | Computes SFR instantly using bundled sample datasets in `raw/` |
| `POST` | `/analyze` | Multipart upload (`student_file`, `faculty_file`) returning full calculations & records |

---

## 6. Verification & Test Commands

```bash
# 1. Run Backend Unit & Edge-Case Tests (5/5 tests)
cd SmartSFR
.\venv\Scripts\python.exe test_comprehensive.py

# 2. Run Backend API Integration Tests (5/5 tests)
cd SmartSFR
.\venv\Scripts\python.exe test_api_integration.py

# 3. Check Frontend TypeScript Compilation (0 errors)
cd accreditation-aid
npx tsc --noEmit

# 4. Compile Frontend Production Build
cd accreditation-aid
npm run build
```
