from pathlib import Path
import unittest
from datetime import date

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
    evaluate_faculty_eligibility,
    get_academic_year_dates,
    get_threshold_explanation,
)

RAW_DIR = Path(__file__).resolve().parent / "raw"


class TestSmartSfrComprehensive(unittest.TestCase):
    def eligibility_record(self, **overrides):
        record = {
            "association": "Regular",
            "full_time": "Yes",
            "first_year_faculty": "No",
            "joining_date": "2023-07-31",
            "leaving_date": "",
        }
        record.update(overrides)
        return record

    def test_faculty_joined_before_august_first_is_eligible(self):
        result = evaluate_faculty_eligibility(
            self.eligibility_record(), date(2023, 8, 1)
        )
        self.assertTrue(result["is_eligible"])

    def test_faculty_joined_exactly_on_august_first_is_eligible(self):
        result = evaluate_faculty_eligibility(
            self.eligibility_record(joining_date="2023-08-01"), date(2023, 8, 1)
        )
        self.assertTrue(result["is_eligible"])

    def test_faculty_joined_august_second_is_excluded(self):
        result = evaluate_faculty_eligibility(
            self.eligibility_record(joining_date="2023-08-02"), date(2023, 8, 1)
        )
        self.assertIn("Joined after August 1.", result["ineligibility_reasons"])

    def test_faculty_leaving_may_thirty_first_is_excluded(self):
        result = evaluate_faculty_eligibility(
            self.eligibility_record(leaving_date="2024-05-31"), date(2023, 8, 1)
        )
        self.assertIn("Left before June 1.", result["ineligibility_reasons"])

    def test_faculty_leaving_june_first_is_eligible(self):
        result = evaluate_faculty_eligibility(
            self.eligibility_record(leaving_date="2024-06-01"), date(2023, 8, 1)
        )
        self.assertTrue(result["is_eligible"])

    def test_faculty_leaving_june_thirtieth_is_eligible(self):
        result = evaluate_faculty_eligibility(
            self.eligibility_record(leaving_date="2024-06-30"), date(2023, 8, 1)
        )
        self.assertTrue(result["is_eligible"])

    def test_empty_leaving_date_means_currently_employed(self):
        result = evaluate_faculty_eligibility(
            self.eligibility_record(leaving_date=""), date(2023, 8, 1)
        )
        self.assertTrue(result["is_eligible"])
        self.assertIsNone(result["leaving_date"])

    def test_part_time_faculty_is_excluded(self):
        result = evaluate_faculty_eligibility(
            self.eligibility_record(full_time="No"), date(2023, 8, 1)
        )
        self.assertIn("Not full-time.", result["ineligibility_reasons"])

    def test_adjunct_designation_is_excluded_even_when_full_time(self):
        result = evaluate_faculty_eligibility(
            self.eligibility_record(designation="Adjunct Professor"),
            date(2023, 8, 1),
        )
        self.assertIn(
            "Ineligible faculty association.", result["ineligibility_reasons"]
        )

    def test_first_year_dedicated_faculty_is_excluded(self):
        result = evaluate_faculty_eligibility(
            self.eligibility_record(first_year_faculty="Yes"), date(2023, 8, 1)
        )
        self.assertIn(
            "First-year dedicated faculty.", result["ineligibility_reasons"]
        )

    def test_invalid_faculty_dates_are_reported(self):
        result = evaluate_faculty_eligibility(
            self.eligibility_record(
                joining_date="not-a-date", leaving_date="2024-13-01"
            ),
            date(2023, 8, 1),
        )
        self.assertFalse(result["is_eligible"])
        self.assertIn(
            "Invalid joining date; use YYYY-MM-DD.", result["ineligibility_reasons"]
        )
        self.assertIn(
            "Invalid leaving date; use YYYY-MM-DD.", result["ineligibility_reasons"]
        )

    def test_missing_joining_date_is_reported(self):
        result = evaluate_faculty_eligibility(
            self.eligibility_record(joining_date=""), date(2023, 8, 1)
        )
        self.assertIn("Missing joining date.", result["ineligibility_reasons"])

    def test_leaving_date_before_joining_date_is_reported(self):
        result = evaluate_faculty_eligibility(
            self.eligibility_record(
                joining_date="2023-09-01", leaving_date="2023-08-31"
            ),
            date(2023, 8, 1),
        )
        self.assertIn(
            "Leaving date is earlier than joining date.",
            result["ineligibility_reasons"],
        )

    def test_faculty_eligibility_is_independent_for_each_academic_year(self):
        student_data = pd.DataFrame(
            [
                {
                    "academic_year": year,
                    "program": "B.Tech",
                    "program_type": "UG",
                    "year_of_study": 2,
                    "student_count": 60,
                }
                for year in ("CAY", "CAYm1", "CAYm2")
            ]
        )
        faculty_data = pd.DataFrame(
            [
                {
                    "academic_year": year,
                    "faculty_id": "F1",
                    "designation": "Professor",
                    **self.eligibility_record(
                        joining_date="2024-08-01", leaving_date="2025-06-15"
                    ),
                }
                for year in ("CAY", "CAYm1", "CAYm2")
            ]
            + [
                {
                    "academic_year": year,
                    "faculty_id": "F2",
                    "designation": "Professor",
                    **self.eligibility_record(joining_date="2020-07-01"),
                }
                for year in ("CAY", "CAYm1", "CAYm2")
            ]
        )
        result = calculate_three_year_sfr(
            student_data, faculty_data, reference_date=date(2025, 9, 15)
        )

        self.assertFalse(result["faculty_records"][0]["is_eligible"])
        self.assertTrue(result["faculty_records"][1]["is_eligible"])
        self.assertFalse(result["faculty_records"][2]["is_eligible"])
        self.assertEqual(result["yearly_results"]["CAY"]["faculty_count"], 1)
        self.assertEqual(result["yearly_results"]["CAYm1"]["faculty_count"], 2)
        self.assertEqual(result["yearly_results"]["CAYm2"]["faculty_count"], 1)

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
            {"academic_year": "CAY", "faculty_id": "F1", "designation": "Prof", "association": "Regular", "full_time": "Yes", "first_year_faculty": "No", "joining_date": "2023-07-15", "leaving_date": ""},
            # Eligible Contractual
            {"academic_year": "CAY", "faculty_id": "F2", "designation": "Asst Prof", "association": "Contractual", "full_time": "Yes", "first_year_faculty": "No", "joining_date": "2023-07-15", "leaving_date": ""},
            # Ineligible: Part-Time
            {"academic_year": "CAY", "faculty_id": "F3", "designation": "Adjunct", "association": "Regular", "full_time": "No", "first_year_faculty": "No", "joining_date": "2023-07-15", "leaving_date": ""},
            # Ineligible: First-Year
            {"academic_year": "CAY", "faculty_id": "F4", "designation": "Asst Prof", "association": "Regular", "full_time": "Yes", "first_year_faculty": "Yes", "joining_date": "2023-07-15", "leaving_date": ""},
            # Ineligible: Visiting
            {"academic_year": "CAY", "faculty_id": "F5", "designation": "Guest", "association": "Visiting", "full_time": "Yes", "first_year_faculty": "No", "joining_date": "2023-07-15", "leaving_date": ""},
        ])

        result = calculate_yearly_sfr(
            student_data, faculty_data, "CAY", reference_date=date(2025, 9, 15)
        )
        self.assertEqual(result["total_students"], 200)
        self.assertEqual(result["faculty_count"], 2)  # F1 and F2 only
        self.assertEqual(result["regular_faculty_count"], 1)
        self.assertEqual(result["contractual_faculty_count"], 1)
        self.assertEqual(result["ineligible_faculty_count"], 3)
        self.assertEqual(result["total_faculty_in_year"], 5)
        self.assertEqual(result["sfr"], 100.0)

    def test_three_year_sfr_calculation_and_records(self):
        """Verify three-year average SFR calculation and records enrichment."""
        student_df = pd.read_csv(RAW_DIR / "dummy_student_data.csv")
        faculty_df = pd.read_csv(RAW_DIR / "dummy_faculty_data.csv")

        res = calculate_three_year_sfr(
            student_df, faculty_df, reference_date=date(2025, 9, 15)
        )

        self.assertIn("yearly_results", res)
        self.assertIn("CAY", res["yearly_results"])
        self.assertIn("CAYm1", res["yearly_results"])
        self.assertIn("CAYm2", res["yearly_results"])
        self.assertEqual(res["yearly_results"]["CAY"]["faculty_count"], 3)
        self.assertEqual(res["yearly_results"]["CAYm1"]["faculty_count"], 3)
        self.assertEqual(res["yearly_results"]["CAYm2"]["faculty_count"], 2)
        self.assertEqual(res["yearly_results"]["CAY"]["academic_year_start_date"], "2025-08-01")
        self.assertEqual(res["yearly_results"]["CAY"]["academic_year_end_date"], "2026-06-30")
        self.assertEqual(res["average_sfr"], 73.0)
        self.assertEqual(res["marks"], 0)
        self.assertEqual(len(res["student_records"]), 15)
        self.assertEqual(len(res["faculty_records"]), 11)
        self.assertEqual(res["faculty_summary"]["eligible_faculty"], 8)
        self.assertEqual(res["faculty_summary"]["ineligible_faculty"], 3)
        self.assertIn("faculty_audit", res)
        self.assertIn("by_year", res["faculty_summary"])

    def test_prompt_example_1_faculty_eligibility_across_three_years(self):
        """
        Faculty joined Sept 15, 2022, left May 15, 2024:
        2021-22: Excluded (Had not joined yet)
        2022-23: Excluded (Joined after August 1)
        2023-24: Excluded (Left before June 1)
        """
        faculty = self.eligibility_record(
            joining_date="2022-09-15", leaving_date="2024-05-15"
        )
        dates_21_22 = get_academic_year_dates("2021-22")
        dates_22_23 = get_academic_year_dates("2022-23")
        dates_23_24 = get_academic_year_dates("2023-24")

        res_21_22 = evaluate_faculty_eligibility(faculty, dates_21_22[0], dates_21_22[1])
        res_22_23 = evaluate_faculty_eligibility(faculty, dates_22_23[0], dates_22_23[1])
        res_23_24 = evaluate_faculty_eligibility(faculty, dates_23_24[0], dates_23_24[1])

        self.assertFalse(res_21_22["is_eligible"])
        self.assertIn("Had not joined yet.", res_21_22["ineligibility_reasons"])

        self.assertFalse(res_22_23["is_eligible"])
        self.assertIn("Joined after August 1.", res_22_23["ineligibility_reasons"])

        self.assertFalse(res_23_24["is_eligible"])
        self.assertIn("Left before June 1.", res_23_24["ineligibility_reasons"])

    def test_prompt_example_2_faculty_eligibility_across_three_years(self):
        """
        Faculty joined July 15, 2022, left May 15, 2024:
        2021-22: Excluded (had not joined)
        2022-23: Eligible
        2023-24: Excluded (left before June 1)
        """
        faculty = self.eligibility_record(
            joining_date="2022-07-15", leaving_date="2024-05-15"
        )
        dates_21_22 = get_academic_year_dates("2021-22")
        dates_22_23 = get_academic_year_dates("2022-23")
        dates_23_24 = get_academic_year_dates("2023-24")

        res_21_22 = evaluate_faculty_eligibility(faculty, dates_21_22[0], dates_21_22[1])
        res_22_23 = evaluate_faculty_eligibility(faculty, dates_22_23[0], dates_22_23[1])
        res_23_24 = evaluate_faculty_eligibility(faculty, dates_23_24[0], dates_23_24[1])

        self.assertFalse(res_21_22["is_eligible"])
        self.assertIn("Had not joined yet.", res_21_22["ineligibility_reasons"])

        self.assertTrue(res_22_23["is_eligible"])
        self.assertEqual(res_22_23["ineligibility_reasons"], [])

        self.assertFalse(res_23_24["is_eligible"])
        self.assertIn("Left before June 1.", res_23_24["ineligibility_reasons"])

    def test_faculty_joined_after_august_in_caym2_eligible_in_cay(self):
        """Test a faculty member who joined after August in CAYm2 but was eligible in CAY."""
        # Reference date 2025-09-15: CAY is 2025-26, CAYm1 is 2024-25, CAYm2 is 2023-24
        faculty = self.eligibility_record(
            joining_date="2023-09-15", leaving_date=""
        )
        cay_start, cay_end = get_academic_year_dates("CAY", reference_date=date(2025, 9, 15))
        caym2_start, caym2_end = get_academic_year_dates("CAYm2", reference_date=date(2025, 9, 15))

        res_caym2 = evaluate_faculty_eligibility(faculty, caym2_start, caym2_end)
        res_cay = evaluate_faculty_eligibility(faculty, cay_start, cay_end)

        self.assertFalse(res_caym2["is_eligible"])
        self.assertIn("Joined after August 1.", res_caym2["ineligibility_reasons"])

        self.assertTrue(res_cay["is_eligible"])
        self.assertEqual(res_cay["ineligibility_reasons"], [])

    def test_faculty_left_before_june_in_cay_eligible_in_caym1(self):
        """Test a faculty member who left before June in CAY but was eligible in CAYm1."""
        # CAY: 2025-26, CAYm1: 2024-25. Left on 2026-05-15 (before June 1, 2026).
        faculty = self.eligibility_record(
            joining_date="2020-07-01", leaving_date="2026-05-15"
        )
        cay_start, cay_end = get_academic_year_dates("CAY", reference_date=date(2025, 9, 15))
        caym1_start, caym1_end = get_academic_year_dates("CAYm1", reference_date=date(2025, 9, 15))

        res_caym1 = evaluate_faculty_eligibility(faculty, caym1_start, caym1_end)
        res_cay = evaluate_faculty_eligibility(faculty, cay_start, cay_end)

        self.assertTrue(res_caym1["is_eligible"])
        self.assertFalse(res_cay["is_eligible"])
        self.assertIn("Left before June 1.", res_cay["ineligibility_reasons"])

    def test_faculty_joined_during_one_year_eligible_in_subsequent_year(self):
        """Test a faculty member who joined during one academic year and became eligible in subsequent."""
        # Joined 2024-10-15 (during CAYm1 2024-25, after Aug 1)
        faculty = self.eligibility_record(
            joining_date="2024-10-15", leaving_date=""
        )
        cay_start, cay_end = get_academic_year_dates("CAY", reference_date=date(2025, 9, 15))
        caym1_start, caym1_end = get_academic_year_dates("CAYm1", reference_date=date(2025, 9, 15))

        res_caym1 = evaluate_faculty_eligibility(faculty, caym1_start, caym1_end)
        res_cay = evaluate_faculty_eligibility(faculty, cay_start, cay_end)

        self.assertFalse(res_caym1["is_eligible"])
        self.assertIn("Joined after August 1.", res_caym1["ineligibility_reasons"])
        self.assertTrue(res_cay["is_eligible"])

    def test_faculty_with_no_leaving_date_remains_eligible(self):
        """Test a faculty member who has no leaving date."""
        faculty = self.eligibility_record(
            joining_date="2021-07-15", leaving_date=""
        )
        for year in ("CAY", "CAYm1", "CAYm2"):
            start, end = get_academic_year_dates(year, reference_date=date(2025, 9, 15))
            res = evaluate_faculty_eligibility(faculty, start, end)
            self.assertTrue(res["is_eligible"])
            self.assertIsNone(res["leaving_date"])

    def test_faculty_has_different_eligibility_statuses_across_all_three_years(self):
        """Test a faculty member with different eligibility statuses across all three years."""
        # Joined 2024-07-15, left 2026-05-15.
        # Reference date 2025-09-15 -> CAY: 2025-26, CAYm1: 2024-25, CAYm2: 2023-24.
        faculty = self.eligibility_record(
            joining_date="2024-07-15", leaving_date="2026-05-15"
        )
        caym2_s, caym2_e = get_academic_year_dates("CAYm2", reference_date=date(2025, 9, 15))
        caym1_s, caym1_e = get_academic_year_dates("CAYm1", reference_date=date(2025, 9, 15))
        cay_s, cay_e = get_academic_year_dates("CAY", reference_date=date(2025, 9, 15))

        res_caym2 = evaluate_faculty_eligibility(faculty, caym2_s, caym2_e)
        res_caym1 = evaluate_faculty_eligibility(faculty, caym1_s, caym1_e)
        res_cay = evaluate_faculty_eligibility(faculty, cay_s, cay_e)

        # CAYm2: Excluded ("Had not joined yet.")
        self.assertFalse(res_caym2["is_eligible"])
        self.assertIn("Had not joined yet.", res_caym2["ineligibility_reasons"])

        # CAYm1: Eligible (joined before Aug 1, 2024, leaves after June 1, 2025)
        self.assertTrue(res_caym1["is_eligible"])

        # CAY: Excluded ("Left before June 1.")
        self.assertFalse(res_cay["is_eligible"])
        self.assertIn("Left before June 1.", res_cay["ineligibility_reasons"])



if __name__ == "__main__":
    unittest.main()
