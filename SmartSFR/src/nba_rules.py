# src/nba_rules.py

"""
NBA Section 4.1 - Student Faculty Ratio Rules

This file contains the official NBA formulas and
marks rules used by the SmartSFR project.
"""


def calculate_total_students(ug2, ug3, ug4, pg1, pg2):
    """
    Calculate the total number of students considered for SFR.

    First-year UG students are excluded according to the
    current project interpretation of the NBA template.
    """
    return ug2 + ug3 + ug4 + pg1 + pg2


def calculate_sfr(total_students, faculty_count):
    """
    Calculate Student-Faculty Ratio.

    SFR = S / F
    """
    if faculty_count <= 0:
        raise ValueError("Faculty count must be greater than zero.")

    return total_students / faculty_count


def calculate_average_sfr(sfr_cay, sfr_caym1, sfr_caym2):
    """
    Calculate average SFR across three assessment years.

    Average SFR = (SFR_CAY + SFR_CAYm1 + SFR_CAYm2) / 3
    """
    return (sfr_cay + sfr_caym1 + sfr_caym2) / 3


def calculate_sfr_marks(average_sfr):
    """
    Calculate NBA marks based on average SFR.

    NBA Section 4.1 marks:
    <=15 -> 15
    <=17 -> 14
    <=19 -> 13
    <=21 -> 12
    <=23 -> 11
    <=25 -> 10
    >25  -> 0
    """

    if average_sfr <= 15:
        return 15
    elif average_sfr <= 17:
        return 14
    elif average_sfr <= 19:
        return 13
    elif average_sfr <= 21:
        return 12
    elif average_sfr <= 23:
        return 11
    elif average_sfr <= 25:
        return 10
    else:
        return 0
