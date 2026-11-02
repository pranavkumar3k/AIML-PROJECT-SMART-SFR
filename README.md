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
* **Eligible:** Full-time departmental teaching faculty (`full_time == "Yes"` and `first_year_faculty == "No"`) with Regular/Contractual association, joining on or before August 1 and not leaving before June 1 for that academic year.
* **Excluded:** Part-time, visiting, hourly, adjunct, first-year dedicated faculty, faculty joining after August 1, and faculty leaving before June 1.
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
academic_year,faculty_id,designation,association,full_time,first_year_faculty,joining_date,leaving_date
CAY,F001,Assistant Professor,Regular,Yes,No,2023-07-15,
CAY,F002,Assistant Professor,Regular,Yes,No,2024-09-10,
CAY,F003,Associate Professor,Regular,Yes,No,2023-06-01,2025-05-15
CAY,F004,Assistant Professor,Contractual,Yes,No,2023-08-01,
```

Faculty eligibility is evaluated independently for CAY, CAYm1, and CAYm2 using each year's August 1–June 30 period. Full-time, non-first-year Regular/Contractual faculty qualify when they joined on or before August 1 and left on or after June 1. CAY is the current academic year and CAYm1/CAYm2 are its two predecessors. An empty `leaving_date` means currently employed.

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
# 1. Run Backend Unit & Edge-Case Tests
cd SmartSFR
.\venv\Scripts\python.exe test_comprehensive.py

# 2. Run Backend API Integration Tests
cd SmartSFR
.\venv\Scripts\python.exe test_api_integration.py

# 3. Check Frontend TypeScript Compilation (0 errors)
cd accreditation-aid
npx tsc --noEmit

# 4. Compile Frontend Production Build
cd accreditation-aid
npm run build
```
