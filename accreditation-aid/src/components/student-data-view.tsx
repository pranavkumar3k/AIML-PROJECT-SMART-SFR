import { useState, useMemo } from "react";
import { Link } from "@tanstack/react-router";
import {
  Users,
  Search,
  Filter,
  GraduationCap,
  BookOpen,
  Calendar,
  RotateCcw,
  Upload,
  Sparkles,
  ArrowUpDown,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useSfr, type StudentRecord } from "@/context/sfr-context";
import { PanelTitle, StatCard } from "@/components/smart-sfr-dashboard";

export function StudentDataView() {
  const { analysis, loadSampleData, analysisState } = useSfr();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedYear, setSelectedYear] = useState<string>("ALL");
  const [selectedProgType, setSelectedProgType] = useState<string>("ALL");
  const [selectedStudyYear, setSelectedStudyYear] = useState<string>("ALL");
  const [sortField, setSortField] = useState<keyof StudentRecord>("academic_year");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const studentRecords = analysis?.student_records ?? [];

  // Filter logic
  const filteredRecords = useMemo(() => {
    return studentRecords.filter((record) => {
      // Search program
      if (
        searchTerm &&
        !record.program.toLowerCase().includes(searchTerm.toLowerCase())
      ) {
        return false;
      }
      // Academic Year filter
      if (selectedYear !== "ALL" && record.academic_year !== selectedYear) {
        return false;
      }
      // Program Type filter
      if (
        selectedProgType !== "ALL" &&
        record.program_type.toUpperCase() !== selectedProgType
      ) {
        return false;
      }
      // Year of Study filter
      if (
        selectedStudyYear !== "ALL" &&
        String(record.year_of_study) !== selectedStudyYear
      ) {
        return false;
      }
      return true;
    }).sort((a, b) => {
      const valA = a[sortField];
      const valB = b[sortField];
      if (typeof valA === "number" && typeof valB === "number") {
        return sortOrder === "asc" ? valA - valB : valB - valA;
      }
      const strA = String(valA).toLowerCase();
      const strB = String(valB).toLowerCase();
      if (strA < strB) return sortOrder === "asc" ? -1 : 1;
      if (strA > strB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  }, [
    studentRecords,
    searchTerm,
    selectedYear,
    selectedProgType,
    selectedStudyYear,
    sortField,
    sortOrder,
  ]);

  const toggleSort = (field: keyof StudentRecord) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedYear("ALL");
    setSelectedProgType("ALL");
    setSelectedStudyYear("ALL");
  };

  const totalFilteredStudents = filteredRecords.reduce(
    (sum, r) => sum + r.student_count,
    0
  );

  const availableYears = useMemo(() => {
    const setYears = new Set(studentRecords.map((r) => r.academic_year));
    return Array.from(setYears);
  }, [studentRecords]);

  if (!analysis || studentRecords.length === 0) {
    return (
      <div className="mx-auto max-w-[1240px] space-y-4 p-3 md:p-5">
        <section className="panel p-8 text-center">
          <div className="mx-auto grid size-16 place-items-center rounded-full bg-info-soft text-primary">
            <Users className="size-8" />
          </div>
          <h2 className="mt-4 text-xl font-bold text-foreground">
            No Student Data Available
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            Student records have not been loaded yet. Please upload your student
            and faculty CSV files on the Dashboard, or load the sample dataset to
            inspect the student analytics.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link to="/">
              <Button className="h-10 px-5">
                <Upload className="size-4 mr-2" />
                Go to Upload & Dashboard
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

  const ugCount = analysis.student_summary?.ug_students ?? 0;
  const pgCount = analysis.student_summary?.pg_students ?? 0;
  const totalCount = analysis.student_summary?.total_students ?? 0;
  const totalRecs = analysis.student_summary?.total_records ?? studentRecords.length;

  return (
    <div className="mx-auto max-w-[1240px] space-y-4 p-3 md:p-5">
      {/* Page Header */}
      <section className="panel p-4 md:p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-foreground md:text-[28px]">
              Student Records & Analytics
            </h1>
            <p className="mt-1 text-xs md:text-sm text-muted-foreground">
              Review and filter the student cohort distribution as used for NBA Chapter 4 (Section 4.1) calculation.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-md font-medium border border-border">
              Source: {analysis.student_summary?.total_records ?? studentRecords.length} Rows Processed
            </span>
          </div>
        </div>
      </section>

      {/* KPI Cards */}
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Records"
          subtitle="Processed Rows"
          value={String(totalRecs)}
          note="From uploaded student CSV"
          icon={BookOpen}
          tone="blue"
        />
        <StatCard
          title="Total Students"
          subtitle="All Years & Programs"
          value={String(totalCount)}
          note="Cumulative student count"
          icon={Users}
          tone="green"
        />
        <StatCard
          title="UG Students"
          subtitle="B.Tech Enrolled"
          value={String(ugCount)}
          note="Years 2, 3 and 4"
          icon={GraduationCap}
          tone="gold"
        />
        <StatCard
          title="PG Students"
          subtitle="M.Tech Enrolled"
          value={String(pgCount)}
          note="Years 1 and 2"
          icon={Calendar}
          tone="violet"
        />
      </section>

      {/* Year-wise Student Statistics Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {["CAY", "CAYm1", "CAYm2"].map((yearKey) => {
          const yearData = analysis.yearly_results[yearKey as keyof typeof analysis.yearly_results];
          if (!yearData) return null;

          return (
            <article key={yearKey} className="panel p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between border-b border-border pb-2.5">
                <span className="font-bold text-sm text-foreground">
                  {yearKey} ({yearData.academic_year})
                </span>
                <Badge variant="outline" className="text-[11px] font-semibold bg-primary/5 text-primary">
                  {yearData.total_students} Students (S)
                </Badge>
              </div>

              <div className="mt-3 grid grid-cols-5 gap-1 text-center text-xs">
                <div className="p-1.5 rounded bg-muted/60">
                  <span className="text-[10px] text-muted-foreground block font-medium">UG2</span>
                  <span className="font-bold text-foreground">{yearData.ug2_students}</span>
                </div>
                <div className="p-1.5 rounded bg-muted/60">
                  <span className="text-[10px] text-muted-foreground block font-medium">UG3</span>
                  <span className="font-bold text-foreground">{yearData.ug3_students}</span>
                </div>
                <div className="p-1.5 rounded bg-muted/60">
                  <span className="text-[10px] text-muted-foreground block font-medium">UG4</span>
                  <span className="font-bold text-foreground">{yearData.ug4_students}</span>
                </div>
                <div className="p-1.5 rounded bg-muted/60">
                  <span className="text-[10px] text-muted-foreground block font-medium">PG1</span>
                  <span className="font-bold text-foreground">{yearData.pg1_students}</span>
                </div>
                <div className="p-1.5 rounded bg-muted/60">
                  <span className="text-[10px] text-muted-foreground block font-medium">PG2</span>
                  <span className="font-bold text-foreground">{yearData.pg2_students}</span>
                </div>
              </div>

              <p className="mt-2.5 text-[11px] text-muted-foreground">
                Formula: S = {yearData.ug2_students} + {yearData.ug3_students} + {yearData.ug4_students} + {yearData.pg1_students} + {yearData.pg2_students}
              </p>
            </article>
          );
        })}
      </section>

      {/* Filter and Search Panel */}
      <section className="panel p-4 space-y-3">
        <div className="flex items-center justify-between">
          <PanelTitle icon={Filter}>Search & Filter Student Records</PanelTitle>
          {(searchTerm || selectedYear !== "ALL" || selectedProgType !== "ALL" || selectedStudyYear !== "ALL") && (
            <Button
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              className="h-8 text-xs text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="size-3 mr-1" />
              Reset Filters
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
            <Input
              placeholder="Search programme..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 text-xs h-10"
            />
          </div>

          {/* Academic Year Filter */}
          <div>
            <select
              aria-label="Filter by Academic Year"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-card px-3 py-2 text-xs shadow-sm ring-offset-background focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="ALL">All Academic Years</option>
              {availableYears.map((yr) => (
                <option key={yr} value={yr}>
                  {yr}
                </option>
              ))}
            </select>
          </div>

          {/* Programme Type Filter */}
          <div>
            <select
              aria-label="Filter by Programme Type"
              value={selectedProgType}
              onChange={(e) => setSelectedProgType(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-card px-3 py-2 text-xs shadow-sm ring-offset-background focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="ALL">All Programme Types (UG/PG)</option>
              <option value="UG">Undergraduate (UG)</option>
              <option value="PG">Postgraduate (PG)</option>
            </select>
          </div>

          {/* Year of Study Filter */}
          <div>
            <select
              aria-label="Filter by Year of Study"
              value={selectedStudyYear}
              onChange={(e) => setSelectedStudyYear(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-card px-3 py-2 text-xs shadow-sm ring-offset-background focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="ALL">All Years of Study (1 - 4)</option>
              <option value="1">1st Year</option>
              <option value="2">2nd Year</option>
              <option value="3">3rd Year</option>
              <option value="4">4th Year</option>
            </select>
          </div>
        </div>

        {/* Filter stats bar */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 px-1">
          <span>
            Showing <strong>{filteredRecords.length}</strong> of <strong>{studentRecords.length}</strong> records
          </span>
          <span>
            Filtered Total Students: <strong className="text-foreground">{totalFilteredStudents}</strong>
          </span>
        </div>
      </section>

      {/* Student Records Table */}
      <section className="panel p-4">
        <div className="overflow-x-auto rounded-md border border-border">
          <table className="w-full min-w-[650px] border-collapse text-center text-xs">
            <thead className="bg-table-header text-foreground">
              <tr>
                <th
                  onClick={() => toggleSort("academic_year")}
                  className="table-cell text-left cursor-pointer hover:bg-muted/80 select-none"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Academic Year</span>
                    <ArrowUpDown className="size-3 text-muted-foreground" />
                  </div>
                </th>
                <th
                  onClick={() => toggleSort("program")}
                  className="table-cell text-left cursor-pointer hover:bg-muted/80 select-none"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Programme</span>
                    <ArrowUpDown className="size-3 text-muted-foreground" />
                  </div>
                </th>
                <th
                  onClick={() => toggleSort("program_type")}
                  className="table-cell cursor-pointer hover:bg-muted/80 select-none"
                >
                  <div className="flex items-center justify-center gap-1.5">
                    <span>Programme Type</span>
                    <ArrowUpDown className="size-3 text-muted-foreground" />
                  </div>
                </th>
                <th
                  onClick={() => toggleSort("year_of_study")}
                  className="table-cell cursor-pointer hover:bg-muted/80 select-none"
                >
                  <div className="flex items-center justify-center gap-1.5">
                    <span>Year of Study</span>
                    <ArrowUpDown className="size-3 text-muted-foreground" />
                  </div>
                </th>
                <th
                  onClick={() => toggleSort("student_count")}
                  className="table-cell cursor-pointer hover:bg-muted/80 select-none"
                >
                  <div className="flex items-center justify-center gap-1.5">
                    <span>Student Count</span>
                    <ArrowUpDown className="size-3 text-muted-foreground" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.length > 0 ? (
                filteredRecords.map((record, index) => (
                  <tr
                    key={`${record.academic_year}-${record.program}-${record.year_of_study}-${index}`}
                    className="border-t border-border bg-card hover:bg-muted/40 transition-colors"
                  >
                    <td className="table-cell text-left font-semibold text-foreground">
                      {record.academic_year}
                    </td>
                    <td className="table-cell text-left font-medium">
                      {record.program}
                    </td>
                    <td className="table-cell">
                      <Badge
                        variant="secondary"
                        className={
                          record.program_type === "UG"
                            ? "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200 border-none"
                            : "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-200 border-none"
                        }
                      >
                        {record.program_type}
                      </Badge>
                    </td>
                    <td className="table-cell font-medium">
                      Year {record.year_of_study}
                    </td>
                    <td className="table-cell font-bold text-foreground">
                      {record.student_count}
                    </td>
                  </tr>
                ))
              ) : (
                <tr className="border-t border-border bg-card">
                  <td colSpan={5} className="table-cell py-8 text-center text-muted-foreground">
                    No student records match the selected filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
            {filteredRecords.length > 0 && (
              <tfoot className="border-t-2 border-border bg-muted/40 font-bold">
                <tr>
                  <td colSpan={4} className="table-cell text-right pr-4">
                    Filtered Total:
                  </td>
                  <td className="table-cell text-center text-primary text-sm font-extrabold">
                    {totalFilteredStudents}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </section>
    </div>
  );
}
