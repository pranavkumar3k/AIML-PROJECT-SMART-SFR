import unittest
import pandas as pd

from src.nba_rules import (
    calculate_total_students,
    calculate_sfr,
    calculate_average_sfr,
    calculate_sfr_marks,
)
from src.sfr_calculator import (
    calculate_yearly_sfr,
    calculate_three_year_sfr,
    get_threshold_explanation,
)


class TestSmartSfrComprehensive(unittest.TestCase):
    def test_nba_marks_thresholds(self):
        """Test NBA Section 4.1 marks thresholds."""
        self.assertEqual(calculate_sfr_marks(14.5), 15)
        self.assertEqual(calculate_sfr_marks(15.0), 15)
        self.assertEqual(calculate_sfr_marks(15.01), 14)
        self.assertEqual(calculate_sfr_marks(17.0), 14)
        self.assertEqual(calculate_sfr_marks(17.01), 13)
        self.assertEqual(calculate_sfr_marks(19.0), 13)
        self.assertEqual(calculate_sfr_marks(19.01), 12)
        self.assertEqual(calculate_sfr_marks(21.0), 12)
        self.assertEqual(calculate_sfr_marks(21.01), 11)
        self.assertEqual(calculate_sfr_marks(23.0), 11)
        self.assertEqual(calculate_sfr_marks(23.01), 10)
        self.assertEqual(calculate_sfr_marks(25.0), 10)
        self.assertEqual(calculate_sfr_marks(25.01), 0)
        self.assertEqual(calculate_sfr_marks(50.0), 0)

    def test_student_formula_ug1_excluded(self):
        """Verify first-year UG is not included in student calculation."""
        # S = UG2 + UG3 + UG4 + PG1 + PG2
        s = calculate_total_students(ug2=60, ug3=55, ug4=50, pg1=20, pg2=15)
        self.assertEqual(s, 200)

    def test_zero_eligible_faculty_raises_value_error(self):
        """Verify division by zero is handled safely."""
        with self.assertRaises(ValueError):
            calculate_sfr(200, 0)

    def test_yearly_sfr_faculty_eligibility_filter(self):
        """Verify faculty filtering (Full-Time=Yes, Non-FY=No, Regular/Contractual)."""
        student_data = pd.DataFrame([
            {"academic_year": "CAY", "program": "B.Tech", "program_type": "UG", "year_of_study": 2, "student_count": 60},
            {"academic_year": "CAY", "program": "B.Tech", "program_type": "UG", "year_of_study": 3, "student_count": 55},
            {"academic_year": "CAY", "program": "B.Tech", "program_type": "UG", "year_of_study": 4, "student_count": 50},
            {"academic_year": "CAY", "program": "M.Tech", "program_type": "PG", "year_of_study": 1, "student_count": 20},
            {"academic_year": "CAY", "program": "M.Tech", "program_type": "PG", "year_of_study": 2, "student_count": 15},
        ])

        faculty_data = pd.DataFrame([
            # Eligible Regular
            {"academic_year": "CAY", "faculty_id": "F1", "designation": "Prof", "association": "Regular", "full_time": "Yes", "first_year_faculty": "No"},
            # Eligible Contractual
            {"academic_year": "CAY", "faculty_id": "F2", "designation": "Asst Prof", "association": "Contractual", "full_time": "Yes", "first_year_faculty": "No"},
            # Ineligible: Part-Time
            {"academic_year": "CAY", "faculty_id": "F3", "designation": "Adjunct", "association": "Regular", "full_time": "No", "first_year_faculty": "No"},
            # Ineligible: First-Year
            {"academic_year": "CAY", "faculty_id": "F4", "designation": "Asst Prof", "association": "Regular", "full_time": "Yes", "first_year_faculty": "Yes"},
            # Ineligible: Visiting
            {"academic_year": "CAY", "faculty_id": "F5", "designation": "Guest", "association": "Visiting", "full_time": "Yes", "first_year_faculty": "No"},
        ])

        result = calculate_yearly_sfr(student_data, faculty_data, "CAY")
        self.assertEqual(result["total_students"], 200)
        self.assertEqual(result["faculty_count"], 2)  # F1 and F2 only
        self.assertEqual(result["regular_faculty_count"], 1)
        self.assertEqual(result["contractual_faculty_count"], 1)
        self.assertEqual(result["ineligible_faculty_count"], 3)
        self.assertEqual(result["total_faculty_in_year"], 5)
        self.assertEqual(result["sfr"], 100.0)

    def test_three_year_sfr_calculation_and_records(self):
        """Verify three-year average SFR calculation and records enrichment."""
        student_df = pd.read_csv("raw/dummy_student_data.csv")
        faculty_df = pd.read_csv("raw/dummy_faculty_data.csv")

        res = calculate_three_year_sfr(student_df, faculty_df)

        self.assertIn("yearly_results", res)
        self.assertIn("CAY", res["yearly_results"])
        self.assertIn("CAYm1", res["yearly_results"])
        self.assertIn("CAYm2", res["yearly_results"])
        self.assertEqual(res["yearly_results"]["CAY"]["sfr"], 50.0)
        self.assertEqual(res["yearly_results"]["CAYm1"]["sfr"], 47.5)
        self.assertEqual(res["yearly_results"]["CAYm2"]["sfr"], 59.33)
        self.assertEqual(res["average_sfr"], 52.28)
        self.assertEqual(res["marks"], 0)
        self.assertEqual(len(res["student_records"]), 15)
        self.assertEqual(len(res["faculty_records"]), 11)
        self.assertEqual(res["faculty_summary"]["eligible_faculty"], 11)
        self.assertEqual(res["faculty_summary"]["ineligible_faculty"], 0)


if __name__ == "__main__":
    unittest.main()
