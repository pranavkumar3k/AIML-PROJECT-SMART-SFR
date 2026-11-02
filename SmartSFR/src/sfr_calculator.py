import re
from datetime import date

import pandas as pd

from src.nba_rules import (
    calculate_total_students,
    calculate_sfr,
    calculate_average_sfr,
    calculate_sfr_marks,
)


ACADEMIC_YEAR_OFFSETS = {"CAY": 0, "CAYm1": 1, "CAYm2": 2}


def get_academic_year_dates(academic_year, reference_date=None):
    """Return the August 1 start and June 30 end for an academic year label or year string."""
    clean_year = str(academic_year).strip()

    if clean_year in ACADEMIC_YEAR_OFFSETS:
        reference_date = reference_date or date.today()
        current_year_start = (
            reference_date.year
            if reference_date.month >= 8
            else reference_date.year - 1
        )
        start_year = current_year_start - ACADEMIC_YEAR_OFFSETS[clean_year]
        return date(start_year, 8, 1), date(start_year + 1, 6, 30)

    # Check if academic_year is a range like "2022-23", "2022-2023", "2022/23"
    match = re.match(r"^(\d{4})[-/](\d{2,4})$", clean_year)
    if match:
        start_year = int(match.group(1))
        return date(start_year, 8, 1), date(start_year + 1, 6, 30)

    # Check if academic_year is a single 4-digit year like "2022"
    match_single = re.match(r"^(\d{4})$", clean_year)
    if match_single:
        start_year = int(match_single.group(1))
        return date(start_year, 8, 1), date(start_year + 1, 6, 30)

    raise ValueError(f"Unsupported academic year: {academic_year}")


def _parse_faculty_date(value, field_name, reasons, optional=False):
    if pd.isna(value) or str(value).strip() == "":
        if not optional:
            reasons.append(f"Missing {field_name}.")
        return None

    value = str(value).strip()
    try:
        parsed_date = date.fromisoformat(value)
    except ValueError:
        reasons.append(f"Invalid {field_name}; use YYYY-MM-DD.")
        return None

    if parsed_date.isoformat() != value:
        reasons.append(f"Invalid {field_name}; use YYYY-MM-DD.")
        return None
    return parsed_date


def evaluate_faculty_eligibility(faculty, academic_year_start, academic_year_end=None):
    """Evaluate one faculty record against one academic year's NBA criteria."""
    reasons = []
    academic_year_end = academic_year_end or date(
        academic_year_start.year + 1, 6, 30
    )
    june_first = date(academic_year_start.year + 1, 6, 1)

    joining_date = _parse_faculty_date(
        faculty.get("joining_date"), "joining date", reasons
    )
    leaving_date = _parse_faculty_date(
        faculty.get("leaving_date"), "leaving date", reasons, optional=True
    )

    is_full_time = str(faculty.get("full_time", "")).strip() == "Yes"
    is_non_first_year = str(faculty.get("first_year_faculty", "")).strip() == "No"
    association = str(faculty.get("association", "")).strip()
    designation = str(faculty.get("designation", "")).casefold()
    disallowed_terms = ("part-time", "part time", "visiting", "hourly", "adjunct")
    disallowed_appointment = any(term in designation for term in disallowed_terms)
    is_valid_association = (
        association in ("Regular", "Contractual") and not disallowed_appointment
    )

    if not is_full_time:
        reasons.append("Not full-time.")
    if not is_non_first_year:
        reasons.append("First-year dedicated faculty.")
    if not is_valid_association:
        reasons.append("Ineligible faculty association.")

    if joining_date and leaving_date and leaving_date < joining_date:
        reasons.append("Leaving date is earlier than joining date.")
    else:
        if joining_date:
            if joining_date > academic_year_end:
                reasons.append("Had not joined yet.")
            elif joining_date > academic_year_start:
                reasons.append("Joined after August 1.")

        if leaving_date:
            if leaving_date < academic_year_start:
                reasons.append("Left before academic year started.")
            elif leaving_date < june_first:
                reasons.append("Left before June 1.")

    return {
        "is_eligible": not reasons,
        "ineligibility_reasons": reasons,
        "joining_date": joining_date.isoformat() if joining_date else None,
        "leaving_date": leaving_date.isoformat() if leaving_date else None,
        "association": association,
        "full_time": "Yes" if is_full_time else "No",
        "first_year_faculty": "No" if is_non_first_year else "Yes",
    }


def get_threshold_explanation(average_sfr):
    """
    Get human-readable explanation of NBA marks criteria applied.
    """
    if average_sfr <= 15:
        return f"Average SFR is {average_sfr:.2f} (<= 15.0), qualifying for full 15 / 15 marks."
    elif average_sfr <= 17:
        return f"Average SFR is {average_sfr:.2f} (> 15 and <= 17.0), qualifying for 14 / 15 marks."
    elif average_sfr <= 19:
        return f"Average SFR is {average_sfr:.2f} (> 17 and <= 19.0), qualifying for 13 / 15 marks."
    elif average_sfr <= 21:
        return f"Average SFR is {average_sfr:.2f} (> 19 and <= 21.0), qualifying for 12 / 15 marks."
    elif average_sfr <= 23:
        return f"Average SFR is {average_sfr:.2f} (> 21 and <= 23.0), qualifying for 11 / 15 marks."
    elif average_sfr <= 25:
        return f"Average SFR is {average_sfr:.2f} (> 23 and <= 25.0), qualifying for 10 / 15 marks."
    else:
        return f"Average SFR is {average_sfr:.2f} (> 25.0), exceeding the maximum NBA threshold, resulting in 0 / 15 marks."


def calculate_yearly_sfr(
    student_df, faculty_df, academic_year, reference_date=None, year_alias=None
):
    """
    Calculate SFR for one academic year.
    """
    academic_year_start, academic_year_end = get_academic_year_dates(
        year_alias or academic_year, reference_date
    )

    matching_years = [academic_year]
    if year_alias and year_alias != academic_year:
        matching_years.append(year_alias)

    students = student_df[
        student_df["academic_year"].astype(str).str.strip().isin(matching_years)
    ]

    ug2 = students[
        (students["program_type"] == "UG") & (students["year_of_study"] == 2)
    ]["student_count"].sum()

    ug3 = students[
        (students["program_type"] == "UG") & (students["year_of_study"] == 3)
    ]["student_count"].sum()

    ug4 = students[
        (students["program_type"] == "UG") & (students["year_of_study"] == 4)
    ]["student_count"].sum()

    pg1 = students[
        (students["program_type"] == "PG") & (students["year_of_study"] == 1)
    ]["student_count"].sum()

    pg2 = students[
        (students["program_type"] == "PG") & (students["year_of_study"] == 2)
    ]["student_count"].sum()

    total_students = calculate_total_students(ug2, ug3, ug4, pg1, pg2)

    if "academic_year" in faculty_df.columns:
        year_faculty_mask = (
            faculty_df["academic_year"].astype(str).str.strip().isin(matching_years)
        )
        if year_faculty_mask.any():
            faculty = faculty_df[year_faculty_mask]
        else:
            faculty = faculty_df
    else:
        faculty = faculty_df

    faculty_eligibility = [
        evaluate_faculty_eligibility(row, academic_year_start, academic_year_end)
        for row in faculty.to_dict("records")
    ]
    eligibility_mask = pd.Series(
        [eligibility["is_eligible"] for eligibility in faculty_eligibility],
        index=faculty.index,
        dtype=bool,
    )
    eligible_faculty = faculty[eligibility_mask]

    regular_faculty_count = len(
        eligible_faculty[eligible_faculty["association"] == "Regular"]
    )
    contractual_faculty_count = len(
        eligible_faculty[eligible_faculty["association"] == "Contractual"]
    )
    faculty_count = len(eligible_faculty)
    total_faculty_in_year = len(faculty)
    ineligible_faculty_count = total_faculty_in_year - faculty_count

    sfr = calculate_sfr(total_students, faculty_count)
    sfr_rounded = float(round(sfr, 2))
    formula_display = f"{int(total_students)} / {int(faculty_count)} = {sfr_rounded:.2f}"

    return {
        "academic_year": academic_year,
        "academic_year_start_date": academic_year_start.isoformat(),
        "academic_year_end_date": academic_year_end.isoformat(),
        "ug2_students": int(ug2),
        "ug3_students": int(ug3),
        "ug4_students": int(ug4),
        "pg1_students": int(pg1),
        "pg2_students": int(pg2),
        "total_students": int(total_students),
        "faculty_count": int(faculty_count),
        "regular_faculty_count": int(regular_faculty_count),
        "contractual_faculty_count": int(contractual_faculty_count),
        "ineligible_faculty_count": int(ineligible_faculty_count),
        "total_faculty_in_year": int(total_faculty_in_year),
        "formula_display": formula_display,
        "sfr": sfr_rounded,
    }


def calculate_three_year_sfr(student_df, faculty_df, reference_date=None):
    """
    Calculate SFR for CAY, CAYm1, and CAYm2,
    then calculate average SFR, marks, and detailed breakdown.
    """

    academic_years = ["CAY", "CAYm1", "CAYm2"]

    # Detect if student_df uses actual academic year labels instead of CAY/CAYm1/CAYm2
    student_years = sorted(
        list(set(student_df["academic_year"].astype(str).str.strip())),
        reverse=True,
    )
    year_alias_map = {}
    if not any(y in academic_years for y in student_years) and len(student_years) >= 3:
        # Map descending years: newest -> CAY, middle -> CAYm1, oldest -> CAYm2
        year_alias_map = {
            "CAY": student_years[0],
            "CAYm1": student_years[1],
            "CAYm2": student_years[2],
        }

    yearly_results = {}

    for year in academic_years:
        yearly_results[year] = calculate_yearly_sfr(
            student_df,
            faculty_df,
            year,
            reference_date,
            year_alias=year_alias_map.get(year),
        )

    sfr_values = [
        yearly_results["CAY"]["sfr"],
        yearly_results["CAYm1"]["sfr"],
        yearly_results["CAYm2"]["sfr"],
    ]

    average_sfr = float(round(calculate_average_sfr(sfr_values[0], sfr_values[1], sfr_values[2]), 2))
    marks = int(calculate_sfr_marks(average_sfr))
    threshold_applied = get_threshold_explanation(average_sfr)

    # Parse and enrich student records
    student_records = []
    for _, row in student_df.iterrows():
        student_records.append(
            {
                "academic_year": str(row["academic_year"]).strip(),
                "program": str(row["program"]).strip(),
                "program_type": str(row["program_type"]).strip(),
                "year_of_study": int(row["year_of_study"]),
                "student_count": int(row["student_count"]),
            }
        )

    # Precalculate dates for each academic year
    year_dates = {}
    for y in academic_years:
        y_start, y_end = get_academic_year_dates(
            year_alias_map.get(y, y), reference_date
        )
        year_dates[y] = (y_start, y_end)

    # Parse and enrich faculty records with NBA eligibility reasons
    faculty_records = []
    for _, row in faculty_df.iterrows():
        academic_year = str(row.get("academic_year", "CAY")).strip()
        # Resolve target dates for the record's academic year
        matched_year_key = academic_year
        for y, alias in year_alias_map.items():
            if academic_year == alias:
                matched_year_key = y
                break

        if matched_year_key in year_dates:
            academic_year_start, academic_year_end = year_dates[matched_year_key]
        else:
            academic_year_start, academic_year_end = get_academic_year_dates(
                academic_year, reference_date
            )

        eligibility = evaluate_faculty_eligibility(
            row, academic_year_start, academic_year_end
        )
        association = eligibility["association"]
        is_eligible = eligibility["is_eligible"]
        ineligibility_reasons = eligibility["ineligibility_reasons"]

        if is_eligible and association == "Contractual":
            nba_verification_status = (
                "Eligible in CSV (Full-Time, Non-FY). Institutional verification required for 2 consecutive semesters and selection procedure."
            )
        elif is_eligible:
            nba_verification_status = "Eligible Regular Faculty"
        else:
            nba_verification_status = "Ineligible: " + "; ".join(ineligibility_reasons)

        # Independent eligibility evaluation for all three academic years
        yearly_eligibility = {}
        for y in academic_years:
            y_start, y_end = year_dates[y]
            y_eval = evaluate_faculty_eligibility(row, y_start, y_end)
            yearly_eligibility[y] = {
                "academic_year": y,
                "academic_year_start_date": y_start.isoformat(),
                "academic_year_end_date": y_end.isoformat(),
                "is_eligible": y_eval["is_eligible"],
                "ineligibility_reasons": y_eval["ineligibility_reasons"],
            }

        faculty_records.append(
            {
                "academic_year": academic_year,
                "academic_year_start_date": academic_year_start.isoformat(),
                "academic_year_end_date": academic_year_end.isoformat(),
                "faculty_id": str(row["faculty_id"]).strip(),
                "designation": str(row["designation"]).strip(),
                "association": association,
                "full_time": eligibility["full_time"],
                "first_year_faculty": eligibility["first_year_faculty"],
                "joining_date": eligibility["joining_date"],
                "leaving_date": eligibility["leaving_date"],
                "is_eligible": is_eligible,
                "ineligibility_reasons": ineligibility_reasons,
                "nba_verification_status": nba_verification_status,
                "yearly_eligibility": yearly_eligibility,
            }
        )

    # Faculty audit: one consolidated entry per unique faculty member across all academic years
    faculty_audit = []
    seen_faculty_ids = set()
    for _, row in faculty_df.iterrows():
        fac_id = str(row["faculty_id"]).strip()
        if fac_id in seen_faculty_ids:
            continue
        seen_faculty_ids.add(fac_id)

        audit_yearly = {}
        for y in academic_years:
            y_start, y_end = year_dates[y]
            y_eval = evaluate_faculty_eligibility(row, y_start, y_end)
            audit_yearly[y] = {
                "academic_year": y,
                "academic_year_start_date": y_start.isoformat(),
                "academic_year_end_date": y_end.isoformat(),
                "is_eligible": y_eval["is_eligible"],
                "ineligibility_reasons": y_eval["ineligibility_reasons"],
                "status": "Eligible" if y_eval["is_eligible"] else "Excluded",
                "reason": "; ".join(y_eval["ineligibility_reasons"])
                if y_eval["ineligibility_reasons"]
                else "None",
            }

        joining_val = row.get("joining_date")
        leaving_val = row.get("leaving_date")
        clean_joining = (
            None
            if pd.isna(joining_val)
            or str(joining_val).strip() in ("", "nan", "None")
            else str(joining_val).strip()
        )
        clean_leaving = (
            None
            if pd.isna(leaving_val)
            or str(leaving_val).strip() in ("", "nan", "None")
            else str(leaving_val).strip()
        )

        faculty_audit.append(
            {
                "faculty_id": fac_id,
                "designation": str(row.get("designation", "")).strip(),
                "association": str(row.get("association", "")).strip(),
                "full_time": str(row.get("full_time", "")).strip(),
                "first_year_faculty": str(row.get("first_year_faculty", "")).strip(),
                "joining_date": clean_joining,
                "leaving_date": clean_leaving,
                "academic_years": audit_yearly,
                "yearly_eligibility": audit_yearly,
            }
        )

    # Student summary statistics
    ug_students = int(
        student_df[student_df["program_type"] == "UG"]["student_count"].sum()
    )
    pg_students = int(
        student_df[student_df["program_type"] == "PG"]["student_count"].sum()
    )
    total_students_sum = int(student_df["student_count"].sum())

    student_summary = {
        "total_records": len(student_records),
        "total_students": total_students_sum,
        "ug_students": ug_students,
        "pg_students": pg_students,
        "years": sorted(list(set(student_df["academic_year"].astype(str).str.strip()))),
    }

    # Faculty summary statistics
    eligible_count = sum(1 for f in faculty_records if f["is_eligible"])
    ineligible_count = len(faculty_records) - eligible_count
    regular_count = sum(
        1 for f in faculty_records if f["is_eligible"] and f["association"] == "Regular"
    )
    contractual_count = sum(
        1
        for f in faculty_records
        if f["is_eligible"] and f["association"] == "Contractual"
    )

    faculty_summary = {
        "total_faculty": len(faculty_records),
        "eligible_faculty": eligible_count,
        "ineligible_faculty": ineligible_count,
        "regular_eligible_faculty": regular_count,
        "contractual_eligible_faculty": contractual_count,
        "by_year": {
            year: {
                "eligible_faculty": yearly_results[year]["faculty_count"],
                "ineligible_faculty": yearly_results[year]["ineligible_faculty_count"],
                "regular_eligible_faculty": yearly_results[year]["regular_faculty_count"],
                "contractual_eligible_faculty": yearly_results[year]["contractual_faculty_count"],
                "total_faculty": yearly_results[year]["total_faculty_in_year"],
            }
            for year in academic_years
        },
    }

    return {
        "yearly_results": yearly_results,
        "average_sfr": average_sfr,
        "marks": marks,
        "threshold_applied": threshold_applied,
        "student_records": student_records,
        "faculty_records": faculty_records,
        "faculty_audit": faculty_audit,
        "student_summary": student_summary,
        "faculty_summary": faculty_summary,
    }

