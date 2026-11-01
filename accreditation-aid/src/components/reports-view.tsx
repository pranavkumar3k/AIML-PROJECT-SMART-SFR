import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  BarChart3,
  Download,
  FileSpreadsheet,
  Printer,
  CheckCircle2,
  AlertTriangle,
  Upload,
  Sparkles,
  Calendar,
  Building,
  GraduationCap,
  Users,
  Award,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSfr } from "@/context/sfr-context";
import { MarksTable, PanelTitle } from "@/components/smart-sfr-dashboard";

export function ReportsView() {
  const { analysis, loadSampleData, analysisState, files } = useSfr();
  const [downloading, setDownloading] = useState(false);

  if (!analysis) {
    return (
      <div className="mx-auto max-w-[1240px] space-y-4 p-3 md:p-5">
        <section className="panel p-8 text-center">
          <div className="mx-auto grid size-16 place-items-center rounded-full bg-info-soft text-primary">
            <BarChart3 className="size-8" />
          </div>
          <h2 className="mt-4 text-xl font-bold text-foreground">
            No Report Data Available
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            To generate and export the NBA Section 4.1 Accreditation Compliance Report,
            please upload your student and faculty CSV datasets on the Dashboard and run the analysis.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link to="/">
              <Button className="h-10 px-5">
                <Upload className="size-4 mr-2" />
                Go to Dashboard
              </Button>
            </Link>
            <Button
              variant="outline"
              className="h-10 px-5"
              onClick={loadSampleData}
              disabled={analysisState === "loading"}
            >
              <Sparkles className="size-4 mr-2 text-primary" />
              Load Sample Data
            </Button>
          </div>
        </section>
      </div>
    );
  }

  const { yearly_results, average_sfr, marks, student_records, faculty_records } = analysis;
  const cay = yearly_results.CAY;
  const caym1 = yearly_results.CAYm1;
  const caym2 = yearly_results.CAYm2;

  // Print report handler
  const handlePrintPdf = () => {
    window.print();
  };

  // CSV/Excel export handler
  const handleExportCsv = () => {
    setDownloading(true);
    try {
      let csvContent = "";

      // Section 1: Executive Summary
      csvContent += "SMARTSFR - NBA ACCREDITATION SECTION 4.1 COMPLIANCE REPORT\n";
      csvContent += `Generated On,${new Date().toLocaleString()}\n`;
      csvContent += `Student Dataset File,${files.student.name}\n`;
      csvContent += `Faculty Dataset File,${files.faculty.name}\n`;
      csvContent += `Assessment Span,CAY (${cay.academic_year}) | CAYm1 (${caym1.academic_year}) | CAYm2 (${caym2.academic_year})\n`;
      csvContent += `3-Year Average SFR,${average_sfr.toFixed(2)}\n`;
      csvContent += `NBA Marks Awarded,${marks} / 15\n\n`;

      // Section 2: Year-wise SFR Breakdown
      csvContent += "YEAR-WISE SFR SUMMARY TABLE (Section 4.1)\n";
      csvContent += "Assessment Year,Academic Year,UG2,UG3,UG4,PG1,PG2,Total Students (S),Eligible Faculty (F),Regular Faculty,Contractual Faculty,Yearly SFR (S/F)\n";
      csvContent += `CAY,${cay.academic_year},${cay.ug2_students},${cay.ug3_students},${cay.ug4_students},${cay.pg1_students},${cay.pg2_students},${cay.total_students},${cay.faculty_count},${cay.regular_faculty_count ?? ""},${cay.contractual_faculty_count ?? ""},${cay.sfr.toFixed(2)}\n`;
      csvContent += `CAYm1,${caym1.academic_year},${caym1.ug2_students},${caym1.ug3_students},${caym1.ug4_students},${caym1.pg1_students},${caym1.pg2_students},${caym1.total_students},${caym1.faculty_count},${caym1.regular_faculty_count ?? ""},${caym1.contractual_faculty_count ?? ""},${caym1.sfr.toFixed(2)}\n`;
      csvContent += `CAYm2,${caym2.academic_year},${caym2.ug2_students},${caym2.ug3_students},${caym2.ug4_students},${caym2.pg1_students},${caym2.pg2_students},${caym2.total_students},${caym2.faculty_count},${caym2.regular_faculty_count ?? ""},${caym2.contractual_faculty_count ?? ""},${caym2.sfr.toFixed(2)}\n\n`;

      // Section 3: Student Cohort Details
      if (student_records && student_records.length > 0) {
        csvContent += "STUDENT ENROLLMENT COHORT DATA\n";
        csvContent += "Academic Year,Programme,Programme Type,Year of Study,Student Count\n";
        student_records.forEach((s) => {
          csvContent += `"${s.academic_year}","${s.program}","${s.program_type}",${s.year_of_study},${s.student_count}\n`;
        });
        csvContent += "\n";
      }

      // Section 4: Faculty Roster and Eligibility
      if (faculty_records && faculty_records.length > 0) {
        csvContent += "FACULTY ROSTER AND NBA ELIGIBILITY AUDIT\n";
        csvContent += "Academic Year,Faculty ID,Designation,Association,Full-Time,First-Year Faculty,Eligibility Status,Verification Remarks\n";
        faculty_records.forEach((f) => {
          csvContent += `"${f.academic_year}","${f.faculty_id}","${f.designation}","${f.association}","${f.full_time}","${f.first_year_faculty}","${f.is_eligible ? "Eligible" : "Ineligible"}","${f.nba_verification_status.replace(/"/g, '""')}"\n`;
        });
      }

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `SmartSFR_NBA_Report_${cay.academic_year}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.error("Export error:", e);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="mx-auto max-w-[1240px] space-y-4 p-3 md:p-5">
      {/* Action Header Banner */}
      <section className="panel p-4 md:p-5 print:hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground md:text-[28px]">
              NBA Compliance & Accreditation Report
            </h1>
            <p className="mt-1 text-xs md:text-sm text-muted-foreground">
              Official Self Assessment Report (SAR) Section 4.1 documentation ready for export and peer review.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              onClick={handlePrintPdf}
              className="h-10 text-xs px-4"
              variant="default"
            >
              <Printer className="size-4 mr-2" />
              Download / Print PDF
            </Button>
            <Button
              onClick={handleExportCsv}
              disabled={downloading}
              className="h-10 text-xs px-4"
              variant="outline"
            >
              <FileSpreadsheet className="size-4 mr-2 text-success" />
              {downloading ? "Exporting..." : "Download Excel / CSV"}
            </Button>
          </div>
        </div>
      </section>

      {/* Printable Report Document Card */}
      <div className="bg-card text-foreground rounded-md border border-border shadow-sm p-6 md:p-8 space-y-6 print:shadow-none print:border-none print:p-0">
        {/* 1. Report Header */}
        <div className="border-b-2 border-primary pb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="grid size-12 place-items-center rounded bg-primary text-primary-foreground font-black text-xl">
              SFR
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">
                SmartSFR Compliance & Analysis Report
              </h2>
              <p className="text-xs text-muted-foreground">
                National Board of Accreditation (NBA) — Chapter 4 (Section 4.1) Self Assessment Report
              </p>
            </div>
          </div>
          <div className="text-right text-xs text-muted-foreground">
            <p><strong>Generated:</strong> {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
            <p><strong>Status:</strong> Evaluated by SmartSFR Engine</p>
          </div>
        </div>

        {/* 2. Assessment Parameters & Metadata */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-muted/40 p-3 rounded-md border border-border text-xs">
          <div>
            <span className="text-muted-foreground block text-[11px]">Assessment Window:</span>
            <span className="font-semibold text-foreground">3 Academic Years</span>
          </div>
          <div>
            <span className="text-muted-foreground block text-[11px]">Current Year (CAY):</span>
            <span className="font-semibold text-foreground">{cay.academic_year}</span>
          </div>
          <div>
            <span className="text-muted-foreground block text-[11px]">Previous Year (CAYm1):</span>
            <span className="font-semibold text-foreground">{caym1.academic_year}</span>
          </div>
          <div>
            <span className="text-muted-foreground block text-[11px]">Prior Year (CAYm2):</span>
            <span className="font-semibold text-foreground">{caym2.academic_year}</span>
          </div>
        </div>

        {/* 3. Section 4.1 SFR Year-wise Table */}
        <div className="space-y-2">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <BarChart3 className="size-4 text-primary" />
            1. Student–Faculty Ratio Assessment (NBA Table 4.1)
          </h3>
          <div className="overflow-x-auto rounded-md border border-border">
            <table className="w-full border-collapse text-center text-xs">
              <thead className="bg-table-header font-bold text-foreground">
                <tr>
                  <th className="table-cell text-left">Academic Year</th>
                  <th className="table-cell">UG2</th>
                  <th className="table-cell">UG3</th>
                  <th className="table-cell">UG4</th>
                  <th className="table-cell">PG1</th>
                  <th className="table-cell">PG2</th>
                  <th className="table-cell">Total Students (S)</th>
                  <th className="table-cell">Eligible Faculty (F)</th>
                  <th className="table-cell">SFR (S/F)</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border">
                  <td className="table-cell text-left font-semibold">CAY ({cay.academic_year})</td>
                  <td className="table-cell">{cay.ug2_students}</td>
                  <td className="table-cell">{cay.ug3_students}</td>
                  <td className="table-cell">{cay.ug4_students}</td>
                  <td className="table-cell">{cay.pg1_students}</td>
                  <td className="table-cell">{cay.pg2_students}</td>
                  <td className="table-cell font-bold">{cay.total_students}</td>
                  <td className="table-cell font-bold">{cay.faculty_count}</td>
                  <td className="table-cell font-extrabold text-primary">{cay.sfr.toFixed(2)}</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="table-cell text-left font-semibold">CAYm1 ({caym1.academic_year})</td>
                  <td className="table-cell">{caym1.ug2_students}</td>
                  <td className="table-cell">{caym1.ug3_students}</td>
                  <td className="table-cell">{caym1.ug4_students}</td>
                  <td className="table-cell">{caym1.pg1_students}</td>
                  <td className="table-cell">{caym1.pg2_students}</td>
                  <td className="table-cell font-bold">{caym1.total_students}</td>
                  <td className="table-cell font-bold">{caym1.faculty_count}</td>
                  <td className="table-cell font-extrabold text-primary">{caym1.sfr.toFixed(2)}</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="table-cell text-left font-semibold">CAYm2 ({caym2.academic_year})</td>
                  <td className="table-cell">{caym2.ug2_students}</td>
                  <td className="table-cell">{caym2.ug3_students}</td>
                  <td className="table-cell">{caym2.ug4_students}</td>
                  <td className="table-cell">{caym2.pg1_students}</td>
                  <td className="table-cell">{caym2.pg2_students}</td>
                  <td className="table-cell font-bold">{caym2.total_students}</td>
                  <td className="table-cell font-bold">{caym2.faculty_count}</td>
                  <td className="table-cell font-extrabold text-primary">{caym2.sfr.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* 4. Three-Year Average SFR and Marks */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-md border border-border bg-muted/30 space-y-2">
            <h4 className="text-xs font-bold text-foreground uppercase tracking-wide">
              3-Year Average SFR Derivation
            </h4>
            <div className="font-mono text-xs space-y-1">
              <div>Average SFR = (SFR_CAY + SFR_CAYm1 + SFR_CAYm2) / 3</div>
              <div className="text-muted-foreground">
                = ({cay.sfr.toFixed(2)} + {caym1.sfr.toFixed(2)} + {caym2.sfr.toFixed(2)}) / 3
              </div>
              <div className="text-sm font-bold text-primary pt-1">
                = {average_sfr.toFixed(2)}
              </div>
            </div>
          </div>

          <div className="p-4 rounded-md border border-primary/30 bg-primary/5 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-muted-foreground block">
                NBA Marks Awarded (Section 4.1)
              </span>
              <div className="text-3xl font-black text-primary mt-1">
                {marks} <span className="text-base font-normal text-muted-foreground">/ 15</span>
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">
                {analysis.threshold_applied}
              </p>
            </div>
            <Award className="size-12 text-primary/40 shrink-0" />
          </div>
        </div>

        {/* 5. Faculty Statistics & Eligibility Summary */}
        <div className="space-y-2">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Users className="size-4 text-primary" />
            2. Faculty Statistics & Eligibility Breakdown
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded border border-border bg-card">
              <span className="text-muted-foreground block text-[11px]">Total Faculty Evaluated:</span>
              <span className="text-base font-bold text-foreground">
                {analysis.faculty_summary?.total_faculty ?? faculty_records?.length ?? 0}
              </span>
            </div>
            <div className="p-3 rounded border border-border bg-card">
              <span className="text-muted-foreground block text-[11px]">Eligible Faculty (Regular / Contractual):</span>
              <span className="text-base font-bold text-success">
                {analysis.faculty_summary?.regular_eligible_faculty ?? 0} Regular / {analysis.faculty_summary?.contractual_eligible_faculty ?? 0} Contractual
              </span>
            </div>
            <div className="p-3 rounded border border-border bg-card">
              <span className="text-muted-foreground block text-[11px]">Ineligible / Excluded:</span>
              <span className="text-base font-bold text-destructive">
                {analysis.faculty_summary?.ineligible_faculty ?? 0}
              </span>
            </div>
          </div>
        </div>

        {/* 6. NBA Scoring Rubric Reference */}
        <div className="space-y-2">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Award className="size-4 text-primary" />
            3. NBA Chapter 4 Scoring Rubric
          </h3>
          <MarksTable />
        </div>

        {/* 7. Methodology & Compliance Remarks */}
        <div className="rounded-md border border-border bg-muted/20 p-4 space-y-2 text-xs text-muted-foreground">
          <h4 className="font-bold text-foreground">Accreditation Methodology & Compliance Notes:</h4>
          <ol className="list-decimal pl-5 space-y-1">
            <li>
              <strong>Student Calculation:</strong> Total students S = UG2 + UG3 + UG4 + PG1 + PG2. First-Year UG students are excluded as their faculty deployment is evaluated separately under Basic Sciences & Humanities (Criterion 2).
            </li>
            <li>
              <strong>Faculty Eligibility Criteria:</strong> Only full-time faculty deployed for departmental teaching (non-first-year) holding Regular or Contractual appointments are included in F.
            </li>
            <li>
              <strong>Contractual Faculty Institutional Verification Note:</strong> Contractual faculty counted in this report have been verified for full-time status and departmental teaching. Colleges must maintain documentary evidence of open selection committee appointment, requisite AICTE/UGC qualifications, and minimum continuous service of two semesters during peer team visit.
            </li>
            <li>
              <strong>Report Integrity:</strong> This report was deterministically computed from verified tabular datasets uploaded to SmartSFR.
            </li>
          </ol>
        </div>

        {/* Signature lines for official documentation */}
        <div className="pt-8 grid grid-cols-3 gap-6 text-center text-xs text-muted-foreground border-t border-border mt-8">
          <div>
            <div className="border-b border-border mb-2 pb-6"></div>
            <p className="font-semibold text-foreground">Prepared by (NBA Coordinator)</p>
          </div>
          <div>
            <div className="border-b border-border mb-2 pb-6"></div>
            <p className="font-semibold text-foreground">Verified by (Head of Department)</p>
          </div>
          <div>
            <div className="border-b border-border mb-2 pb-6"></div>
            <p className="font-semibold text-foreground">Approved by (Principal / Dean)</p>
          </div>
        </div>
      </div>
    </div>
  );
}
