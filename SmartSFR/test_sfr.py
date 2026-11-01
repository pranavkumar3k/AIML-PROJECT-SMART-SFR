import pandas as pd

from src.sfr_calculator import calculate_three_year_sfr

student_df = pd.read_csv("raw/dummy_student_data.csv")

faculty_df = pd.read_csv("raw/dummy_faculty_data.csv")

result = calculate_three_year_sfr(student_df, faculty_df)


print("\n========== SmartSFR Analysis ==========\n")

for academic_year, data in result["yearly_results"].items():
    print(f"Academic Year: {academic_year}")
    print(f"UG 2nd Year Students : {data['ug2_students']}")
    print(f"UG 3rd Year Students : {data['ug3_students']}")
    print(f"UG 4th Year Students : {data['ug4_students']}")
    print(f"PG 1st Year Students : {data['pg1_students']}")
    print(f"PG 2nd Year Students : {data['pg2_students']}")
    print(f"Total Students       : {data['total_students']}")
    print(f"Eligible Faculty     : {data['faculty_count']}")
    print(f"SFR                  : {data['sfr']}")
    print("--------------------------------------")

print(f"Average SFR : {result['average_sfr']}")
print(f"NBA Marks   : {result['marks']}")

print("\n=======================================\n")
