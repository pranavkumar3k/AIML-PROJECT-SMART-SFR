from src.nba_rules import (
    calculate_total_students,
    calculate_sfr,
    calculate_average_sfr,
    calculate_sfr_marks,
)


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


def calculate_yearly_sfr(student_df, faculty_df, academic_year):
    """
    Calculate SFR for one academic year.
    """

    students = student_df[student_df["academic_year"] == academic_year]
    faculty = faculty_df[faculty_df["academic_year"] == academic_year]

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

    eligible_faculty = faculty[
        (faculty["full_time"] == "Yes")
        & (faculty["first_year_faculty"] == "No")
        & (faculty["association"].isin(["Regular", "Contractual"]))
    ]

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


def calculate_three_year_sfr(student_df, faculty_df):
    """
    Calculate SFR for CAY, CAYm1, and CAYm2,
    then calculate average SFR, marks, and detailed breakdown.
    """

    academic_years = ["CAY", "CAYm1", "CAYm2"]

    yearly_results = {}

    for year in academic_years:
        yearly_results[year] = calculate_yearly_sfr(student_df, faculty_df, year)

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

    # Parse and enrich faculty records with NBA eligibility reasons
    faculty_records = []
    for _, row in faculty_df.iterrows():
        is_full_time = str(row["full_time"]).strip() == "Yes"
        is_non_first_year = str(row["first_year_faculty"]).strip() == "No"
        association = str(row["association"]).strip()
        is_valid_assoc = association in ["Regular", "Contractual"]

        is_eligible = is_full_time and is_non_first_year and is_valid_assoc

        ineligibility_reasons = []
        if not is_full_time:
            ineligibility_reasons.append("Not full-time employment")
        if not is_non_first_year:
            ineligibility_reasons.append("Dedicated to First Year students")
        if not is_valid_assoc:
            ineligibility_reasons.append(
                f"Association '{association}' is neither Regular nor Contractual"
            )

        if is_eligible and association == "Contractual":
            nba_verification_status = (
                "Eligible in CSV (Full-Time, Non-FY). Institutional verification required for 2 consecutive semesters and selection procedure."
            )
        elif is_eligible:
            nba_verification_status = "Eligible Regular Faculty"
        else:
            nba_verification_status = "Ineligible: " + "; ".join(ineligibility_reasons)

        faculty_records.append(
            {
                "academic_year": str(row["academic_year"]).strip(),
                "faculty_id": str(row["faculty_id"]).strip(),
                "designation": str(row["designation"]).strip(),
                "association": association,
                "full_time": "Yes" if is_full_time else "No",
                "first_year_faculty": "Yes" if not is_non_first_year else "No",
                "is_eligible": is_eligible,
                "ineligibility_reasons": ineligibility_reasons,
                "nba_verification_status": nba_verification_status,
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
    }

    return {
        "yearly_results": yearly_results,
        "average_sfr": average_sfr,
        "marks": marks,
        "threshold_applied": threshold_applied,
        "student_records": student_records,
        "faculty_records": faculty_records,
        "student_summary": student_summary,
        "faculty_summary": faculty_summary,
    }
