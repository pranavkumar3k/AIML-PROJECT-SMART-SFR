# Accreditation Aid

I am building a project called SmartSFR.

SmartSFR is an academic accreditation support application that calculates and validates the Student-Faculty Ratio according to the NBA accreditation template, specifically Section 4.1.

I already have an existing Python backend project stored in GitHub. The existing repository contains:

- src/nba_rules.py

- src/sfr_calculator.py

- src/preprocessing.py

- src/decision_engine.py

- src/prediction.py

- app.py

- raw/dummy_student_data.csv

- raw/dummy_faculty_data.csv

- requirements.txt

The current backend calculation logic is Python-based and uses pandas.

The main NBA calculation is:

1. Calculate the total students:

   S = UG2 + UG3 + UG4 + PG1 + PG2

2. Select eligible faculty:

   - Regular faculty are included.

   - Eligible full-time contractual faculty are included.

   - First-year faculty are excluded.

   - Part-time and hourly faculty are excluded.

3. Calculate yearly SFR:

   SFR = Total Students / Eligible Faculty

4. Calculate the three-year average:

   Average SFR = (SFR_CAY + SFR_CAYm1 + SFR_CAYm2) / 3

5. Calculate NBA marks:

   - Average SFR <= 15: 15 marks

   - Average SFR <= 17: 14 marks

   - Average SFR <= 19: 13 marks

   - Average SFR <= 21: 12 marks

   - Average SFR <= 23: 11 marks

   - Average SFR <= 25: 10 marks

   - Average SFR > 25: 0 marks

For now, I want to build only the frontend UI. Do not unnecessarily rewrite or replace my existing Python calculation logic.

The frontend should initially use mock data that visually matches the attached reference screenshot. Later, it will be connected to the Python backend through an API.

Please first understand the requirements and create the frontend structure. Do not add unnecessary features or change the main design direction.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/509190ea-4f60-4c40-b9ca-4c0efcc2730f).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
