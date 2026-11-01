import { Link } from "@tanstack/react-router";
import {
  GraduationCap,
  BookOpen,
  Users,
  UserCheck,
  Calculator,
  Award,
  CheckCircle2,
  ShieldCheck,
  FileSpreadsheet,
  ArrowRight,
  Info,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PanelTitle, MarksTable } from "@/components/smart-sfr-dashboard";

export function AboutView() {
  return (
    <div className="mx-auto max-w-[1240px] space-y-4 p-3 md:p-5">
      {/* Header */}
      <section className="panel p-5 md:p-6 bg-gradient-to-r from-card to-primary/5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="grid size-14 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <GraduationCap className="size-9" strokeWidth={2.2} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground md:text-[30px]">
              About SmartSFR
            </h1>
            <p className="mt-1 text-xs md:text-sm text-muted-foreground max-w-2xl">
              Automated Student–Faculty Ratio (SFR) Analysis and NBA Accreditation Decision Support System for Engineering and Technical Programs.
            </p>
          </div>
        </div>
      </section>

      {/* 1. Project Overview & Problem Solved */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <article className="panel p-5 space-y-3">
          <PanelTitle icon={Info}>Project Overview & Purpose</PanelTitle>
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>SmartSFR</strong> is an academic decision support web application built to streamline and automate the complex calculations required for Criterion 4, Section 4.1 (Student-Faculty Ratio) of the National Board of Accreditation (NBA) Self Assessment Report (SAR).
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            During NBA accreditation preparation, academic institutions must collate student enrollment across multiple undergraduate and postgraduate years alongside faculty rosters across three assessment years: <strong>CAY</strong> (Current Academic Year), <strong>CAYm1</strong> (CAY minus 1), and <strong>CAYm2</strong> (CAY minus 2). Manual calculation is prone to errors in faculty eligibility determination and student cohort aggregation.
          </p>
          <div className="pt-2 flex items-center gap-2 text-xs font-semibold text-primary">
            <CheckCircle2 className="size-4" />
            Reliable, deterministic, and auditable calculations.
          </div>
        </article>

        <article className="panel p-5 space-y-3">
          <PanelTitle icon={Users}>Intended Users & Stakeholders</PanelTitle>
          <p className="text-xs text-muted-foreground leading-relaxed">
            SmartSFR is tailored specifically for higher education administrators and accreditation committees, including:
          </p>
          <ul className="text-xs text-muted-foreground space-y-2 pl-2">
            <li className="flex items-start gap-2">
              <span className="grid size-5 shrink-0 place-items-center rounded bg-primary/10 text-primary font-bold text-[10px]">1</span>
              <span><strong>Heads of Department (HODs):</strong> Validate departmental faculty deployment and student intake alignment.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="grid size-5 shrink-0 place-items-center rounded bg-primary/10 text-primary font-bold text-[10px]">2</span>
              <span><strong>NBA Accreditation Coordinators:</strong> Ensure criterion calculations match Section 4.1 SAR guidelines before submission.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="grid size-5 shrink-0 place-items-center rounded bg-primary/10 text-primary font-bold text-[10px]">3</span>
              <span><strong>Internal Quality Assurance Cells (IQAC):</strong> Monitor year-on-year faculty hiring needs to sustain high accreditation scores.</span>
            </li>
          </ul>
        </article>
      </section>

      {/* 2. NBA Methodology & Formula Breakdown */}
      <section className="panel p-5 space-y-4">
        <PanelTitle icon={BookOpen}>NBA Accreditation Methodology (Chapter 4, Section 4.1)</PanelTitle>
        <p className="text-xs text-muted-foreground leading-relaxed">
          The National Board of Accreditation evaluates teaching faculty strength in relation to student numbers over a 3-year assessment window. Below are the governing mathematical formulas:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Student Formula */}
          <div className="rounded-md border border-border bg-muted/40 p-4 space-y-2">
            <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5 uppercase tracking-wide">
              <Users className="size-3.5 text-primary" />
              1. Student Formula (S)
            </h3>
            <div className="p-2.5 rounded bg-card border border-border/80 font-mono text-xs font-bold text-primary">
              S = UG2 + UG3 + UG4 + PG1 + PG2
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              <strong>Why UG1 is excluded:</strong> First-year undergraduate students are enrolled in foundational sciences and humanities courses taught by first-year faculty. Their ratios are evaluated separately under NBA Criterion 2.
            </p>
          </div>

          {/* Faculty Formula */}
          <div className="rounded-md border border-border bg-muted/40 p-4 space-y-2">
            <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5 uppercase tracking-wide">
              <UserCheck className="size-3.5 text-success" />
              2. Eligible Faculty (F)
            </h3>
            <div className="p-2.5 rounded bg-card border border-border/80 font-mono text-xs font-bold text-success">
              F = F_Regular + F_Contractual
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Only full-time faculty deployed for departmental engineering instruction are counted. Excludes part-time, visiting, hourly, and first-year dedicated faculty.
            </p>
          </div>

          {/* Ratio & Average */}
          <div className="rounded-md border border-border bg-muted/40 p-4 space-y-2">
            <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5 uppercase tracking-wide">
              <Calculator className="size-3.5 text-primary" />
              3. Yearly & Average SFR
            </h3>
            <div className="p-2.5 rounded bg-card border border-border/80 font-mono text-xs font-bold text-foreground space-y-1">
              <div>SFR = S / F</div>
              <div className="text-[11px] text-muted-foreground pt-0.5 border-t border-border">
                Avg SFR = (SFR_CAY + SFR_CAYm1 + SFR_CAYm2) / 3
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              The arithmetic mean over CAY, CAYm1, and CAYm2 is used to award accreditation marks out of 15.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Faculty Eligibility Criteria - Implemented vs Institutional Verification */}
      <section className="panel p-5 space-y-3">
        <PanelTitle icon={ShieldCheck}>Faculty Eligibility Norms & Compliance Standards</PanelTitle>
        <p className="text-xs text-muted-foreground leading-relaxed">
          To ensure strict adherence to NBA standards without overstating compliance, SmartSFR explicitly bifurcates verified dataset attributes from conditions requiring institutional documentary proof:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          <div className="rounded-md border border-success-border bg-success-soft/30 p-4 space-y-2">
            <h3 className="text-xs font-bold text-success-foreground flex items-center gap-2">
              <CheckCircle2 className="size-4 text-success" />
              Directly Verified from CSV Attributes:
            </h3>
            <ul className="text-xs text-muted-foreground space-y-1.5 list-disc pl-5">
              <li><strong>Full-Time Status:</strong> Faculty marked with <code>full_time == "Yes"</code>. Part-time and visiting faculty are excluded.</li>
              <li><strong>Departmental Teaching:</strong> Faculty marked with <code>first_year_faculty == "No"</code> (teaching UG2, UG3, UG4, PG).</li>
              <li><strong>Valid Association:</strong> Association classified as <code>Regular</code> or <code>Contractual</code>.</li>
            </ul>
          </div>

          <div className="rounded-md border border-amber-300 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20 p-4 space-y-2">
            <h3 className="text-xs font-bold text-amber-950 dark:text-amber-200 flex items-center gap-2">
              <Info className="size-4 text-amber-600" />
              Contractual Norms Requiring Institutional Proof:
            </h3>
            <ul className="text-xs text-muted-foreground space-y-1.5 list-disc pl-5">
              <li><strong>Selection Procedure:</strong> Appointed through a duly constituted selection committee as per AICTE/UGC/State Government norms.</li>
              <li><strong>Service Duration:</strong> Served at the institution for at least two consecutive semesters in the assessment year.</li>
              <li><strong>Qualifications & Experience:</strong> Possess prescribed AICTE qualifications and minimum pay-scale equivalence.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* 4. NBA Marks Rubric Table */}
      <section className="panel p-5 space-y-3">
        <PanelTitle icon={Award}>NBA Section 4.1 Marks Rubric (Out of 15)</PanelTitle>
        <p className="text-xs text-muted-foreground">
          The table below indicates the official marks awarded by the NBA visiting peer committee based on 3-year average SFR:
        </p>
        <MarksTable />
        <div className="mt-2 text-xs text-muted-foreground">
          <em>Note: An Average SFR of 15.0 or lower achieves the full 15 marks. Any ratio exceeding 25.0 yields 0 marks under Section 4.1.</em>
        </div>
      </section>

      {/* Bottom CTA Card */}
      <section className="panel p-5 flex flex-col sm:flex-row items-center justify-between gap-4 bg-muted/20">
        <div>
          <h3 className="font-bold text-sm text-foreground">Ready to analyze your department data?</h3>
          <p className="text-xs text-muted-foreground">Upload your student and faculty datasets on the Dashboard or inspect pre-calculated results.</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link to="/">
            <Button size="sm" className="h-9 px-4 text-xs">
              Go to Dashboard
              <ArrowRight className="size-3.5 ml-1.5" />
            </Button>
          </Link>
          <Link to="/reports">
            <Button size="sm" variant="outline" className="h-9 px-4 text-xs">
              View Reports
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
