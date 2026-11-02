import io
import unittest
import asyncio
from pathlib import Path
from fastapi import UploadFile
from fastapi.exceptions import HTTPException

from app import analyze, sample_analysis, root, health_check

RAW_DIR = Path(__file__).resolve().parent / "raw"


class TestApiIntegration(unittest.TestCase):
    def test_root_and_health(self):
        self.assertEqual(root(), {"message": "SmartSFR backend is running"})
        self.assertEqual(health_check(), {"status": "ok"})

    def test_sample_analysis_endpoint(self):
        res = sample_analysis()
        self.assertIn("yearly_results", res)
        self.assertIn("average_sfr", res)
        self.assertIn("marks", res)
        self.assertIn("student_records", res)
        self.assertIn("faculty_records", res)
        self.assertIn("faculty_audit", res)
        self.assertGreater(res["average_sfr"], 0)
        self.assertTrue(
            all("joining_date" in record and "leaving_date" in record
                for record in res["faculty_records"])
        )

    def test_analyze_valid_upload(self):
        async def _run():
            with open(RAW_DIR / "dummy_student_data.csv", "rb") as sf, open(RAW_DIR / "dummy_faculty_data.csv", "rb") as ff:
                student_upload = UploadFile(filename="student.csv", file=io.BytesIO(sf.read()))
                faculty_upload = UploadFile(filename="faculty.csv", file=io.BytesIO(ff.read()))
                res = await analyze(student_file=student_upload, faculty_file=faculty_upload)
                self.assertIn("yearly_results", res)
                self.assertIn("faculty_audit", res)
                self.assertEqual(
                    res["yearly_results"]["CAY"]["faculty_count"],
                    sum(
                        record["academic_year"] == "CAY" and record["is_eligible"]
                        for record in res["faculty_records"]
                    ),
                )
                self.assertEqual(len(res["student_records"]), 15)
                self.assertEqual(len(res["faculty_records"]), 11)

        asyncio.run(_run())

    def test_analyze_missing_columns(self):
        async def _run():
            bad_csv = b"academic_year,invalid_col\nCAY,1"
            good_faculty = b"academic_year,faculty_id,designation,association,full_time,first_year_faculty,joining_date,leaving_date\nCAY,F1,Prof,Regular,Yes,No,2023-07-15,"

            student_upload = UploadFile(filename="student.csv", file=io.BytesIO(bad_csv))
            faculty_upload = UploadFile(filename="faculty.csv", file=io.BytesIO(good_faculty))

            with self.assertRaises(HTTPException) as cm:
                await analyze(student_file=student_upload, faculty_file=faculty_upload)
            self.assertEqual(cm.exception.status_code, 400)
            self.assertIn("missing", str(cm.exception.detail).lower())

        asyncio.run(_run())

    def test_analyze_empty_file(self):
        async def _run():
            student_upload = UploadFile(filename="student.csv", file=io.BytesIO(b""))
            faculty_upload = UploadFile(filename="faculty.csv", file=io.BytesIO(b"content"))

            with self.assertRaises(HTTPException) as cm:
                await analyze(student_file=student_upload, faculty_file=faculty_upload)
            self.assertEqual(cm.exception.status_code, 400)

        asyncio.run(_run())


if __name__ == "__main__":
    unittest.main()
