# src/test_sfr.py
from pathlib import Path
import pandas as pd

try:
    from src.sfr_calculator import calculate_three_year_sfr
except ImportError:
    from sfr_calculator import calculate_three_year_sfr

if __name__ == "__main__":
    base_dir = Path(__file__).resolve().parent.parent
    student_df = pd.read_csv(base_dir / "raw" / "dummy_student_data.csv")
    faculty_df = pd.read_csv(base_dir / "raw" / "dummy_faculty_data.csv")

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

