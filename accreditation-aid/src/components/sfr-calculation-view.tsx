import { Link } from "@tanstack/react-router";
import {
  Calculator,
  CheckCircle2,
  AlertCircle,
  TrendingDown,
  TrendingUp,
  Award,
  Upload,
  Sparkles,
  ArrowRight,
  BookOpen,
  UserCheck,
  Percent,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSfr, type YearlyResult } from "@/context/sfr-context";
import { PanelTitle, StatCard, MarksTable } from "@/components/smart-sfr-dashboard";

export function SfrCalculationView() {
  const { analysis, loadSampleData, analysisState } = useSfr();

  if (!analysis) {
    return (
      <div className="mx-auto max-w-[1240px] space-y-4 p-3 md:p-5">
        <section className="panel p-8 text-center">
          <div className="mx-auto grid size-16 place-items-center rounded-full bg-info-soft text-primary">
            <Calculator className="size-8" />
          </div>
          <h2 className="mt-4 text-xl font-bold text-foreground">
            No SFR Calculation Available
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            To view the detailed Student-Faculty Ratio breakdown and NBA scoring
            computation, please upload your student and faculty datasets on the
            Dashboard or run the analysis.
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

  const { yearly_results, average_sfr, marks, threshold_applied } = analysis;
  const cay = yearly_results.CAY;
  const caym1 = yearly_results.CAYm1;
  const caym2 = yearly_results.CAYm2;

  const yearsList: { key: string; name: string; label: string; data: YearlyResult }[] = [
    { key: "CAY", name: cay.academic_year, label: "Current Academic Year", data: cay },
    { key: "CAYm1", name: caym1.academic_year, label: "Current Academic Year minus 1", data: caym1 },
    { key: "CAYm2", name: caym2.academic_year, label: "Current Academic Year minus 2", data: caym2 },
  ];

  return (
    <div className="mx-auto max-w-[1240px] space-y-4 p-3 md:p-5">
      {/* Header */}
      <section className="panel p-4 md:p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-foreground md:text-[28px]">
              SFR Calculation Breakdown
            </h1>
            <p className="mt-1 text-xs md:text-sm text-muted-foreground">
              Mathematical derivation of Student-Faculty Ratio and NBA Section 4.1 marks across the 3 assessment years.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-3 py-1 rounded-md bg-primary text-primary-foreground">
              NBA Criteria: Chapter 4, Sec 4.1
            </span>
          </div>
        </div>
      </section>

      {/* Top 3-Year Summary KPI Cards */}
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="3-Year Average SFR"
          subtitle="(CAY + CAYm1 + CAYm2)/3"
          value={average_sfr.toFixed(2)}
          note="Evaluated for Section 4.1"
          icon={Calculator}
          tone="gold"
        />
        <StatCard
          title="NBA Marks Awarded"
          subtitle="Out of 15 Marks"
          value={`${marks} / 15`}
          note={marks > 0 ? "Qualified for accreditation marks" : "SFR exceeded maximum threshold of 25.0"}
          icon={Award}
          tone={marks > 0 ? "green" : "violet"}
        />
        <StatCard
          title="CAY SFR"
          subtitle={cay.academic_year}
          value={cay.sfr.toFixed(2)}
          note={`${cay.total_students} Students / ${cay.faculty_count} Faculty`}
          icon={Percent}
          tone="blue"
        />
        <StatCard
          title="Assessment Span"
          subtitle="Evaluation Period"
          value="3 Years"
          note={`${caym2.academic_year} → ${cay.academic_year}`}
          icon={BookOpen}
          tone="green"
        />
      </section>

      {/* Year-by-Year Detailed Breakdown Cards */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <PanelTitle icon={Calculator}>Annual Assessment Calculations (CAY, CAYm1, CAYm2)</PanelTitle>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {yearsList.map(({ key, name, label, data }) => (
            <article key={key} className="panel p-4 flex flex-col justify-between border-t-4 border-t-primary">
              <div>
                {/* Year Header */}
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <div>
                    <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                      <span>{key}</span>
                      <Badge variant="outline" className="text-xs font-medium">
                        {name}
                      </Badge>
                    </h3>
                    <p className="text-[11px] text-muted-foreground">{label}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-muted-foreground block">Yearly SFR</span>
                    <span className="text-xl font-extrabold text-primary">{data.sfr.toFixed(2)}</span>
                  </div>
                </div>

                {/* 1. Student Calculation Breakdown */}
                <div className="mt-3.5 space-y-2">
                  <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5 uppercase tracking-wide">
                    <BookOpen className="size-3.5 text-primary" />
                    Student Calculation (S)
                  </h4>
                  <div className="rounded-md border border-border bg-muted/40 p-2.5 text-xs space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">UG 2nd Year (UG2):</span>
                      <span className="font-semibold text-foreground">{data.ug2_students}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">UG 3rd Year (UG3):</span>
                      <span className="font-semibold text-foreground">{data.ug3_students}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">UG 4th Year (UG4):</span>
                      <span className="font-semibold text-foreground">{data.ug4_students}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">PG 1st Year (PG1):</span>
                      <span className="font-semibold text-foreground">{data.pg1_students}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">PG 2nd Year (PG2):</span>
                      <span className="font-semibold text-foreground">{data.pg2_students}</span>
                    </div>
                    <div className="border-t border-border/80 pt-1.5 flex justify-between font-bold text-foreground">
                      <span>Total Students (S):</span>
                      <span className="text-primary">{data.total_students}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground italic pt-0.5">
                      Formula: S = UG2 + UG3 + UG4 + PG1 + PG2 (1st year UG excluded)
                    </p>
                  </div>
                </div>

                {/* 2. Faculty Calculation Breakdown */}
                <div className="mt-3.5 space-y-2">
                  <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5 uppercase tracking-wide">
                    <UserCheck className="size-3.5 text-success" />
                    Faculty Calculation (F)
                  </h4>
                  <div className="rounded-md border border-border bg-muted/40 p-2.5 text-xs space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Regular Eligible Faculty:</span>
                      <span className="font-semibold text-foreground">{data.regular_faculty_count ?? "—"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Contractual Eligible Faculty:</span>
                      <span className="font-semibold text-foreground">{data.contractual_faculty_count ?? "—"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Ineligible/Excluded Faculty:</span>
                      <span className="font-semibold text-muted-foreground">{data.ineligible_faculty_count ?? 0}</span>
                    </div>
                    <div className="border-t border-border/80 pt-1.5 flex justify-between font-bold text-foreground">
                      <span>Total Eligible Faculty (F):</span>
                      <span className="text-success font-extrabold">{data.faculty_count}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Individual SFR Formula Result */}
              <div className="mt-4 pt-3 border-t border-border">
                <div className="rounded-md bg-primary/10 border border-primary/20 p-2.5 text-center">
                  <span className="text-[11px] font-semibold text-muted-foreground block">
                    Annual SFR Formula (S / F)
                  </span>
                  <div className="text-sm font-bold text-primary mt-0.5">
                    {data.formula_display || `${data.total_students} / ${data.faculty_count} = ${data.sfr.toFixed(2)}`}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* 3-Year Average Calculation Card */}
      <section className="panel p-5">
        <PanelTitle icon={Calculator}>Three-Year Average SFR Calculation</PanelTitle>
        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground leading-relaxed">
              According to NBA Section 4.1 guidelines, the assessment score is determined by computing the arithmetic mean of the Student-Faculty Ratio across the three consecutive academic years under evaluation:
            </p>
            <div className="rounded-md bg-muted/60 border border-border p-3.5 font-mono text-xs text-foreground space-y-2">
              <div className="font-bold text-primary">
                Average SFR = (SFR_CAY + SFR_CAYm1 + SFR_CAYm2) / 3
              </div>
              <div className="text-muted-foreground">
                = ({cay.sfr.toFixed(2)} + {caym1.sfr.toFixed(2)} + {caym2.sfr.toFixed(2)}) / 3
              </div>
              <div className="text-muted-foreground">
                = {(cay.sfr + caym1.sfr + caym2.sfr).toFixed(2)} / 3
              </div>
              <div className="text-sm font-bold text-foreground border-t border-border/60 pt-1.5">
                = <span className="text-primary">{average_sfr.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center p-6 rounded-md bg-gradient-to-br from-card to-muted/50 border border-border text-center">
            <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
              Final Computed 3-Year Average
            </span>
            <div className="text-4xl font-extrabold text-foreground mt-2">
              {average_sfr.toFixed(2)}
            </div>
            <div className="mt-3 flex items-center gap-2">
              <Badge
                className={
                  average_sfr <= 25
                    ? "bg-success text-success-contrast border-none"
                    : "bg-destructive text-destructive-foreground border-none"
                }
              >
                {average_sfr <= 25 ? "Within NBA Scoring Range" : "Exceeds NBA Threshold (> 25.0)"}
              </Badge>
            </div>
          </div>
        </div>
      </section>

      {/* NBA Marks & Threshold Applied */}
      <section className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.3fr)_minmax(360px,1fr)] gap-4">
        <article className="panel p-5 space-y-3">
          <h2 className="flex items-center gap-2 text-sm font-bold text-foreground">
            <Award className="size-5 text-primary" />
            NBA Marks Allocation (Section 4.1)
          </h2>
          <p className="text-xs text-muted-foreground">
            NBA awards marks out of 15 based on the Average SFR bracket:
          </p>
          <MarksTable />
          <div className="mt-3 p-3 rounded-md bg-info-soft/60 border border-info-border text-xs text-info-foreground">
            <strong>Applied Threshold:</strong> {threshold_applied || (
              marks > 0
                ? `Average SFR ${average_sfr.toFixed(2)} yields ${marks} out of 15 marks.`
                : `Average SFR ${average_sfr.toFixed(2)} exceeds 25.0, resulting in 0 marks.`
            )}
          </div>
        </article>

        <article className="panel p-5 flex flex-col justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-base font-bold text-foreground">
              <CheckCircle2 className="size-5 text-success" />
              Final Evaluation Result
            </h2>
            <div className="mt-4 p-4 rounded-md border border-border bg-card text-center">
              <span className="text-xs text-muted-foreground block font-medium">
                Section 4.1 Marks Awarded
              </span>
              <div className="text-4xl font-extrabold text-primary mt-1">
                {marks} <span className="text-lg font-normal text-muted-foreground">/ 15</span>
              </div>
            </div>
            <p className="mt-3 text-xs text-muted-foreground leading-relaxed">
              {marks === 15 && "Outstanding ratio! The program achieves full 15/15 marks for Student-Faculty Ratio."}
              {marks > 0 && marks < 15 && `The program secures ${marks}/15 marks for NBA Section 4.1 based on an average SFR of ${average_sfr.toFixed(2)}.`}
              {marks === 0 && `The program receives 0/15 marks because the average SFR (${average_sfr.toFixed(2)}) is higher than the maximum eligible threshold of 25.0.`}
            </p>
          </div>

          <div className="pt-4 border-t border-border mt-4 flex justify-end">
            <Link to="/reports">
              <Button size="sm" className="h-9 text-xs">
                Generate Full Accreditation Report
                <ArrowRight className="size-3.5 ml-1.5" />
              </Button>
            </Link>
          </div>
        </article>
      </section>
    </div>
  );
}
