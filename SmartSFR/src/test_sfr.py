# src/test_sfr.py

import pandas as pd

from sfr_calculator import calculate_three_year_sfr

# Read external CSV files
student_df = pd.read_csv("../raw/dummy_student_data.csv")
faculty_df = pd.read_csv("../raw/dummy_faculty_data.csv")


# Calculate SFR
result = calculate_three_year_sfr(student_df, faculty_df)


# Display results
print("NBA Student-Faculty Ratio Calculation")
print("--------------------------------------")

for year, data in result["yearly_results"].items():
    print(f"{year}:")
    print(f"  Total Students (S): {data['total_students']}")
    print(f"  Faculty Count (F): {data['faculty_count']}")
    print(f"  SFR: {data['sfr']:.2f}")
    print()

print(f"Average SFR: {result['average_sfr']:.2f}")
print(f"NBA Marks: {result['marks']}")
