import { useRef, type ChangeEvent } from "react";
import { Link } from "@tanstack/react-router";
import {
  BarChart3,
  Calculator,
  Check,
  CheckCircle2,
  CircleAlert,
  Database,
  FileSpreadsheet,
  FolderOpen,
  Info,
  Play,
  RotateCcw,
  Sparkles,
  Star,
  UserRound,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useSfr, type FileKind, type AnalysisResult } from "@/context/sfr-context";

const MARKS = [
  { range: "≤ 15", marks: 15 },
  { range: "> 15 – 17", marks: 14 },
  { range: "> 17 – 19", marks: 13 },
  { range: "> 19 – 21", marks: 12 },
  { range: "> 21 – 23", marks: 11 },
  { range: "> 23 – 25", marks: 10 },
  { range: "> 25", marks: 0 },
];

export function PanelTitle({
  icon: Icon,
  children,
}: {
  icon: typeof BarChart3;
  children: string;
}) {
  return (
    <h2 className="flex items-center gap-2 text-[15px] font-bold text-foreground">
      <Icon className="size-5 text-primary" aria-hidden="true" />
      {children}
    </h2>
  );
}

function FilePicker({
  kind,
  name,
  records,
  onFileChange,
}: {
  kind: FileKind;
  name: string;
  records: number;
  onFileChange: (kind: FileKind, event: ChangeEvent<HTMLInputElement>) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const label = kind === "student" ? "Student Data (CSV)" : "Faculty Data (CSV)";

  return (
    <div className="min-w-0 flex-1">
      <label className="mb-1.5 block text-xs font-bold text-foreground">{label}</label>
      <input
        ref={inputRef}
        className="sr-only"
        type="file"
        accept=".csv,text/csv"
        onChange={(event) => onFileChange(kind, event)}
      />
      <div className="flex gap-2">
        <div className="flex h-10 min-w-0 flex-1 items-center rounded-md border border-input bg-input-surface px-3 text-xs text-foreground shadow-inner">
          <span className="truncate">{name}</span>
          <CheckCircle2 className="ml-auto size-4 shrink-0 text-success" aria-label="File ready" />
        </div>
        <Button
          type="button"
          variant="secondary"
          className="h-10 px-4"
          onClick={() => inputRef.current?.click()}
        >
          Browse
        </Button>
      </div>
      <p className="mt-1 text-[11px] text-muted-foreground">{records} records loaded</p>
    </div>
  );
}

export function StatCard({
  title,
  subtitle,
  value,
  note,
  icon: Icon,
  tone,
}: {
  title: string;
  subtitle: string;
  value: string;
  note?: string;
  icon: typeof Users;
  tone: "blue" | "green" | "gold" | "violet";
}) {
  const toneClass = {
    blue: "stat-card-blue",
    green: "stat-card-green",
    gold: "stat-card-gold",
    violet: "stat-card-violet",
  }[tone];

  return (
    <article className={cn("stat-card", toneClass)}>
      <Icon className="size-10 shrink-0 text-stat-icon" strokeWidth={2.2} aria-hidden="true" />
      <div className="min-w-0">
        <h3 className="text-[13px] font-bold leading-4 text-foreground">
          {title}
          <span className="block">{subtitle}</span>
        </h3>
        <p className="mt-1 text-2xl font-bold leading-none text-foreground">{value}</p>
        {note ? <p className="mt-1 text-[10px] text-muted-foreground">{note}</p> : null}
      </div>
    </article>
  );
}

export function SfrChart({ yearlyResults }: { yearlyResults: AnalysisResult["yearly_results"] | null }) {
  const X_POSITIONS = [84, 205, 326];
  const Y_TOP = 30;
  const Y_BOTTOM = 140;

  const rows = yearlyResults
    ? [yearlyResults.CAY, yearlyResults.CAYm1, yearlyResults.CAYm2]
    : [];

  const sfrValues = rows.map((row) => row.sfr);
  const minSfr = sfrValues.length ? Math.min(...sfrValues) : 0;
  const maxSfr = sfrValues.length ? Math.max(...sfrValues) : 1;
  const range = maxSfr - minSfr || 1;

  const chartPoints = rows.map((row, index) => ({
    x: X_POSITIONS[index],
    y: Y_BOTTOM - ((row.sfr - minSfr) / range) * (Y_BOTTOM - Y_TOP),
    label: row.sfr.toFixed(2),
    year: row.academic_year,
  }));

  return (
    <div className="mt-2 min-h-[180px] w-full" aria-label="SFR comparison line chart">
      <svg viewBox="0 0 400 190" className="h-full w-full overflow-visible" role="img">
        <title>SFR comparison for CAY, CAYm1 and CAYm2</title>
        {[36, 64, 92, 120, 148].map((y) => (
          <line key={y} x1="48" x2="366" y1={y} y2={y} className="stroke-chart-grid" strokeWidth="1" />
        ))}
        <line x1="48" x2="48" y1="20" y2="148" className="stroke-chart-axis" />
        <line x1="48" x2="366" y1="148" y2="148" className="stroke-chart-axis" />
        {chartPoints.length ? (
          <>
            <polyline
              points={chartPoints.map((point) => `${point.x},${point.y}`).join(" ")}
              fill="none"
              className="stroke-primary"
              strokeWidth="2.5"
            />
            {chartPoints.map((point) => (
              <g key={point.year}>
                <circle cx={point.x} cy={point.y} r="4.5" className="fill-primary" />
                <text x={point.x} y={point.y - 13} textAnchor="middle" className="fill-foreground text-[11px] font-bold">
                  {point.label}
                </text>
                <text x={point.x} y="169" textAnchor="middle" className="fill-muted-foreground text-[10px]">
                  {point.year}
                </text>
              </g>
            ))}
          </>
        ) : (
          X_POSITIONS.map((x, index) => (
            <text key={x} x={x} y="169" textAnchor="middle" className="fill-muted-foreground text-[10px]">
              {["CAY", "CAYm1", "CAYm2"][index]}
            </text>
          ))
        )}
        <text x="20" y="89" textAnchor="middle" transform="rotate(-90 20 89)" className="fill-muted-foreground text-[10px] font-semibold">
          SFR
        </text>
      </svg>
      <div className="-mt-1 flex items-center justify-center gap-2 text-[10px] text-muted-foreground">
        <span className="h-0.5 w-5 bg-primary" />
        <span>SFR</span>
      </div>
    </div>
  );
}

export function YearlyTable({ yearlyResults }: { yearlyResults: AnalysisResult["yearly_results"] | null }) {
  const rows = yearlyResults
    ? [yearlyResults.CAY, yearlyResults.CAYm1, yearlyResults.CAYm2]
    : [];

  return (
    <div className="mt-3 overflow-x-auto rounded-md border border-border">
      <table className="w-full min-w-[620px] border-collapse text-center text-[11px]">
        <thead className="bg-table-header text-foreground">
          <tr>
            <th className="table-cell text-left">Academic Year</th>
            <th className="table-cell">UG2</th>
            <th className="table-cell">UG3</th>
            <th className="table-cell">UG4</th>
            <th className="table-cell">PG1</th>
            <th className="table-cell">PG2</th>
            <th className="table-cell">Total Students<br />(S)</th>
            <th className="table-cell">Eligible Faculty<br />(F)</th>
            <th className="table-cell">SFR<br />(S/F)</th>
          </tr>
        </thead>
        <tbody>
          {rows.length ? (
            rows.map((row) => (
              <tr key={row.academic_year} className="border-t border-border bg-card">
                <td className="table-cell text-left font-semibold">{row.academic_year}</td>
                <td className="table-cell">{row.ug2_students}</td>
                <td className="table-cell">{row.ug3_students}</td>
                <td className="table-cell">{row.ug4_students}</td>
                <td className="table-cell">{row.pg1_students}</td>
                <td className="table-cell">{row.pg2_students}</td>
                <td className="table-cell">{row.total_students}</td>
                <td className="table-cell">{row.faculty_count}</td>
                <td className="table-cell font-semibold">{row.sfr.toFixed(2)}</td>
              </tr>
            ))
          ) : (
            <tr className="border-t border-border bg-card">
              <td className="table-cell py-4 text-muted-foreground" colSpan={9}>
                Run an analysis or load sample data to see year-wise results.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export function MarksTable() {
  return (
    <div className="mt-2 overflow-x-auto rounded-md border border-danger-border">
      <table className="w-full min-w-[500px] border-collapse text-center text-[10px]">
        <tbody>
          <tr className="bg-danger-soft">
            <th className="table-cell text-left">Average SFR range</th>
            {MARKS.map((item) => (
              <td className="table-cell font-medium" key={item.range}>
                {item.range}
              </td>
            ))}
          </tr>
          <tr className="border-t border-danger-border bg-card">
            <th className="table-cell text-left">Marks</th>
            {MARKS.map((item) => (
              <td className="table-cell font-semibold" key={item.range}>
                {item.marks}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export function SmartSfrDashboard() {
  const {
    files,
    analysisState,
    analysis,
    error,
    onFileChange,
    runAnalysis,
    loadSampleData,
    resetAll,
  } = useSfr();

  return (
    <div className="mx-auto max-w-[1240px] space-y-3 p-3 md:p-5">
      <section className="panel px-4 py-4 md:px-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-foreground md:text-[30px]">Welcome to SmartSFR</h1>
            <p className="mt-1 text-sm text-muted-foreground md:text-base">
              Calculate, validate and analyse your Student-Faculty Ratio as per NBA guidelines.
            </p>
          </div>
          {analysis ? (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={resetAll}
                className="text-xs text-muted-foreground"
              >
                <RotateCcw className="size-3.5 mr-1" />
                Reset Data
              </Button>
            </div>
          ) : null}
        </div>

        {analysis === null ? (
          <div className="mt-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-md border border-info-border bg-info-soft px-4 py-2.5 text-xs font-medium text-info-foreground">
            <div className="flex items-center gap-2.5">
              <Info className="size-4 shrink-0 text-primary" aria-hidden="true" />
              <p>Ready to analyze. Browse your student and faculty CSV files below, or load the built-in sample dataset to preview.</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={loadSampleData}
              disabled={analysisState === "loading"}
              className="bg-card text-foreground hover:bg-card/90 shrink-0 text-xs font-semibold"
            >
              <Sparkles className="size-3.5 mr-1.5 text-primary" />
              Load Sample Data
            </Button>
          </div>
        ) : (
          <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-border/60 text-xs">
            <Link
              to="/student-data"
              className="flex items-center gap-1.5 p-2 rounded hover:bg-muted font-medium text-primary"
            >
              <Users className="size-3.5" />
              <span>View Student Records ({analysis.student_records?.length ?? 0})</span>
            </Link>
            <Link
              to="/faculty-data"
              className="flex items-center gap-1.5 p-2 rounded hover:bg-muted font-medium text-primary"
            >
              <UserRound className="size-3.5" />
              <span>View Faculty Roster ({analysis.faculty_records?.length ?? 0})</span>
            </Link>
            <Link
              to="/sfr-calculation"
              className="flex items-center gap-1.5 p-2 rounded hover:bg-muted font-medium text-primary"
            >
              <Calculator className="size-3.5" />
              <span>View SFR Breakdown</span>
            </Link>
            <Link
              to="/reports"
              className="flex items-center gap-1.5 p-2 rounded hover:bg-muted font-medium text-primary"
            >
              <FileSpreadsheet className="size-3.5" />
              <span>Generate NBA Report</span>
            </Link>
          </div>
        )}
      </section>

      <section className="panel p-4">
        <PanelTitle icon={FolderOpen}>Data Files</PanelTitle>
        <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end">
          <FilePicker
            kind="student"
            name={files.student.name}
            records={files.student.records}
            onFileChange={onFileChange}
          />
          <FilePicker
            kind="faculty"
            name={files.faculty.name}
            records={files.faculty.records}
            onFileChange={onFileChange}
          />
          <div className="flex flex-col sm:flex-row gap-2 lg:border-l lg:border-border lg:pl-5">
            <Button
              className="h-12 w-full px-6 text-sm lg:w-auto"
              onClick={() => runAnalysis()}
              disabled={analysisState === "loading"}
            >
              {analysisState === "complete" ? <Check /> : <Play className="fill-current" />}
              {analysisState === "loading"
                ? "Analyzing..."
                : analysisState === "complete"
                ? "Analysis Complete"
                : "Run Analysis"}
            </Button>
            <Button
              variant="outline"
              className="h-12 px-4 text-xs"
              onClick={loadSampleData}
              disabled={analysisState === "loading"}
              title="Quick-load sample dataset from backend"
            >
              <Database className="size-4 mr-1.5" />
              Use Sample Data
            </Button>
          </div>
        </div>
      </section>

      {error ? (
        <div className="rounded-md border border-danger-border bg-danger-soft px-4 py-3 text-sm text-danger-foreground">
          {error}
        </div>
      ) : null}

      <section aria-label="Summary statistics" className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Students"
          subtitle="(CAY)"
          value={analysis ? String(analysis.yearly_results.CAY.total_students) : "—"}
          note="(Current Academic Year)"
          icon={Users}
          tone="blue"
        />
        <StatCard
          title="Eligible Faculty"
          subtitle="(CAY)"
          value={analysis ? String(analysis.yearly_results.CAY.faculty_count) : "—"}
          note="(Current Academic Year)"
          icon={UserRound}
          tone="green"
        />
        <StatCard
          title="Average SFR"
          subtitle="(3 Years)"
          value={analysis ? analysis.average_sfr.toFixed(2) : "—"}
          icon={Calculator}
          tone="gold"
        />
        <StatCard
          title="NBA Marks"
          subtitle="(Section 4.1)"
          value={analysis ? `${analysis.marks} / 15` : "—"}
          icon={Star}
          tone="violet"
        />
      </section>

      <section className="grid gap-3 xl:grid-cols-[minmax(0,1.65fr)_minmax(320px,0.85fr)]">
        <article className="panel min-w-0 p-4">
          <PanelTitle icon={BarChart3}>Year-wise SFR Calculation</PanelTitle>
          <YearlyTable yearlyResults={analysis?.yearly_results ?? null} />
        </article>
        <article className="panel min-w-0 p-4">
          <PanelTitle icon={BarChart3}>SFR Comparison</PanelTitle>
          <SfrChart yearlyResults={analysis?.yearly_results ?? null} />
        </article>
      </section>

      <section className="grid gap-3 xl:grid-cols-[minmax(0,1.35fr)_minmax(360px,1fr)]">
        <article className="min-w-0 rounded-md border border-danger-border bg-danger-soft p-3">
          <h2 className="flex items-center gap-2 text-sm font-bold text-danger-foreground">
            <CircleAlert className="size-4 fill-danger text-danger-icon" aria-hidden="true" />
            NBA Marks Criteria (Section 4.1)
          </h2>
          <MarksTable />
        </article>
        <article className="min-w-0 rounded-md border border-success-border bg-success-soft p-4">
          <h2 className="flex items-center gap-2 text-base font-bold text-success-foreground">
            <span className="grid size-6 place-items-center rounded-full bg-success text-success-contrast">
              <Check className="size-4" strokeWidth={3} aria-hidden="true" />
            </span>
            Result
          </h2>
          <p className="mt-2 pl-8 text-xs leading-5 text-foreground">
            {analysis ? (
              <>
                Based on the current data, the program would get <strong>{analysis.marks} out of 15 marks</strong> for Section 4.1 (Student-Faculty Ratio).
                {analysis.threshold_applied ? (
                  <span className="block mt-1 text-muted-foreground font-normal">
                    {analysis.threshold_applied}
                  </span>
                ) : null}
              </>
            ) : (
              "Run an analysis or load sample data to see the NBA marks result for Section 4.1 (Student-Faculty Ratio)."
            )}
          </p>
        </article>
      </section>

      <footer className="flex flex-wrap items-center justify-between gap-2 px-1 pb-1 text-[10px] text-muted-foreground md:hidden">
        <span>SmartSFR v1.0</span>
        <span>Built for NBA Accreditation Support</span>
      </footer>
    </div>
  );
}
