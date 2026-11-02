import os
from io import BytesIO
from pathlib import Path

import pandas as pd
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from src.sfr_calculator import calculate_three_year_sfr

app = FastAPI(
    title="SmartSFR API",
    description="Backend API for Student-Faculty Ratio analysis",
    version="1.0.0",
)


# Allows the local React/TanStack Start frontend to call this backend.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = Path(__file__).resolve().parent
RAW_DIR = BASE_DIR / "raw"


@app.get("/")
def root():
    return {"message": "SmartSFR backend is running"}


@app.get("/health")
def health_check():
    return {"status": "ok"}


@app.get("/sample-analysis")
def sample_analysis():
    """
    Returns analysis computed from the bundled sample/dummy datasets in the raw/ folder.
    """
    student_path = RAW_DIR / "dummy_student_data.csv"
    faculty_path = RAW_DIR / "dummy_faculty_data.csv"

    if not student_path.exists() or not faculty_path.exists():
        raise HTTPException(
            status_code=404,
            detail="Sample data files not found in the raw/ folder."
        )

    try:
        student_df = pd.read_csv(student_path)
        faculty_df = pd.read_csv(faculty_path)
        result = calculate_three_year_sfr(student_df, faculty_df)
        return result
    except Exception as error:
        raise HTTPException(
            status_code=500, detail=f"Failed to process sample data: {str(error)}"
        )


@app.post("/analyze")
async def analyze(
    student_file: UploadFile = File(...), faculty_file: UploadFile = File(...)
):
    try:
        student_content = await student_file.read()
        faculty_content = await faculty_file.read()

        if not student_content:
            raise HTTPException(
                status_code=400,
                detail="Student CSV file is empty. Please provide a valid CSV file."
            )

        if not faculty_content:
            raise HTTPException(
                status_code=400,
                detail="Faculty CSV file is empty. Please provide a valid CSV file."
            )

        try:
            student_df = pd.read_csv(BytesIO(student_content))
        except Exception as e:
            raise HTTPException(
                status_code=400,
                detail=f"Unable to parse Student CSV: {str(e)}"
            )

        try:
            faculty_df = pd.read_csv(BytesIO(faculty_content))
        except Exception as e:
            raise HTTPException(
                status_code=400,
                detail=f"Unable to parse Faculty CSV: {str(e)}"
            )

        required_student_columns = {
            "academic_year",
            "program",
            "program_type",
            "year_of_study",
            "student_count",
        }

        required_faculty_columns = {
            "academic_year",
            "faculty_id",
            "designation",
            "association",
            "full_time",
            "first_year_faculty",
            "joining_date",
            "leaving_date",
        }

        missing_student_columns = required_student_columns - set(student_df.columns)
        missing_faculty_columns = required_faculty_columns - set(faculty_df.columns)

        if missing_student_columns:
            raise HTTPException(
                status_code=400,
                detail={
                    "message": "Student CSV is missing required columns.",
                    "missing_columns": sorted(list(missing_student_columns)),
                },
            )

        if missing_faculty_columns:
            raise HTTPException(
                status_code=400,
                detail={
                    "message": "Faculty CSV is missing required columns.",
                    "missing_columns": sorted(list(missing_faculty_columns)),
                },
            )

        # Validate non-empty data
        if len(student_df) == 0:
            raise HTTPException(status_code=400, detail="Student CSV contains no data rows.")
        if len(faculty_df) == 0:
            raise HTTPException(status_code=400, detail="Faculty CSV contains no data rows.")

        result = calculate_three_year_sfr(student_df, faculty_df)
        return result

    except HTTPException:
        raise

    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error))

    except Exception as error:
        raise HTTPException(
            status_code=500, detail=f"Unable to analyze files: {str(error)}"
        )
