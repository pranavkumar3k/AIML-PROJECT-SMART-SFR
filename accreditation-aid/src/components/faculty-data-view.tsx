import { useState, useMemo } from "react";
import { Link } from "@tanstack/react-router";
import {
  UserRound,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  Upload,
  Sparkles,
  ArrowUpDown,
  ShieldAlert,
  Info,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useSfr, type FacultyRecord } from "@/context/sfr-context";
import { PanelTitle, StatCard } from "@/components/smart-sfr-dashboard";

export function FacultyDataView() {
  const { analysis, loadSampleData, analysisState } = useSfr();

  const [searchId, setSearchId] = useState("");
  const [searchDesignation, setSearchDesignation] = useState("");
  const [selectedYear, setSelectedYear] = useState<string>("ALL");
  const [selectedAssoc, setSelectedAssoc] = useState<string>("ALL");
  const [selectedEligibility, setSelectedEligibility] = useState<string>("ALL");
  const [sortField, setSortField] = useState<keyof FacultyRecord>("academic_year");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const facultyRecords = analysis?.faculty_records ?? [];

  const filteredRecords = useMemo(() => {
    return facultyRecords.filter((record) => {
      // Search by Faculty ID
      if (
        searchId &&
        !record.faculty_id.toLowerCase().includes(searchId.toLowerCase())
      ) {
        return false;
      }
      // Search by Designation
      if (
        searchDesignation &&
        !record.designation.toLowerCase().includes(searchDesignation.toLowerCase())
      ) {
        return false;
      }
      // Academic Year filter
      if (selectedYear !== "ALL" && record.academic_year !== selectedYear) {
        return false;
      }
      // Association filter
      if (
        selectedAssoc !== "ALL" &&
        record.association.toLowerCase() !== selectedAssoc.toLowerCase()
      ) {
        return false;
      }
      // Eligibility filter
      if (selectedEligibility !== "ALL") {
        if (selectedEligibility === "ELIGIBLE" && !record.is_eligible) return false;
        if (selectedEligibility === "INELIGIBLE" && record.is_eligible) return false;
      }
      return true;
    }).sort((a, b) => {
      const valA = a[sortField];
      const valB = b[sortField];
      if (typeof valA === "boolean") {
        return sortOrder === "asc"
          ? (valA === valB ? 0 : valA ? -1 : 1)
          : (valA === valB ? 0 : valA ? 1 : -1);
      }
      const strA = String(valA).toLowerCase();
      const strB = String(valB).toLowerCase();
      if (strA < strB) return sortOrder === "asc" ? -1 : 1;
      if (strA > strB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  }, [
    facultyRecords,
    searchId,
    searchDesignation,
    selectedYear,
    selectedAssoc,
    selectedEligibility,
    sortField,
    sortOrder,
  ]);

  const toggleSort = (field: keyof FacultyRecord) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const resetFilters = () => {
    setSearchId("");
    setSearchDesignation("");
    setSelectedYear("ALL");
    setSelectedAssoc("ALL");
    setSelectedEligibility("ALL");
  };

  const availableYears = useMemo(() => {
    const setYears = new Set(facultyRecords.map((r) => r.academic_year));
    return Array.from(setYears);
  }, [facultyRecords]);

  if (!analysis || facultyRecords.length === 0) {
    return (
      <div className="mx-auto max-w-[1240px] space-y-4 p-3 md:p-5">
        <section className="panel p-8 text-center">
          <div className="mx-auto grid size-16 place-items-center rounded-full bg-info-soft text-primary">
            <UserRound className="size-8" />
          </div>
          <h2 className="mt-4 text-xl font-bold text-foreground">
            No Faculty Data Available
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            Faculty records have not been loaded yet. Please upload your student
            and faculty CSV files on the Dashboard, or load the sample dataset to
            inspect the faculty eligibility status.
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

  const totalFacultyCount = analysis.faculty_summary?.total_faculty ?? facultyRecords.length;
  const eligibleCount = analysis.faculty_summary?.eligible_faculty ?? facultyRecords.filter(f => f.is_eligible).length;
  const ineligibleCount = analysis.faculty_summary?.ineligible_faculty ?? (totalFacultyCount - eligibleCount);
  const regularCount = analysis.faculty_summary?.regular_eligible_faculty ?? facultyRecords.filter(f => f.is_eligible && f.association === "Regular").length;
  const contractualCount = analysis.faculty_summary?.contractual_eligible_faculty ?? facultyRecords.filter(f => f.is_eligible && f.association === "Contractual").length;

  return (
    <div className="mx-auto max-w-[1240px] space-y-4 p-3 md:p-5">
      {/* Page Header */}
      <section className="panel p-4 md:p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-foreground md:text-[28px]">
              Faculty Roster & NBA Eligibility
            </h1>
            <p className="mt-1 text-xs md:text-sm text-muted-foreground">
              Review and audit faculty records against NBA Section 4.1 eligibility criteria.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-md font-medium border border-border">
              {totalFacultyCount} Total Records Loaded
            </span>
          </div>
        </div>
      </section>

      {/* KPI Cards */}
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Faculty"
          subtitle="All Roster Entries"
          value={String(totalFacultyCount)}
          note="Across CAY, CAYm1, CAYm2"
          icon={UserRound}
          tone="blue"
        />
        <StatCard
          title="Eligible Faculty"
          subtitle="NBA Compliant"
          value={String(eligibleCount)}
          note="Full-time, Non-FY, Regular/Contractual"
          icon={CheckCircle2}
          tone="green"
        />
        <StatCard
          title="Ineligible Faculty"
          subtitle="Excluded from SFR"
          value={String(ineligibleCount)}
          note="Part-time, 1st Year, or other"
          icon={XCircle}
          tone="violet"
        />
        <StatCard
          title="Faculty Breakdown"
          subtitle="Regular vs Contractual"
          value={`${regularCount}R / ${contractualCount}C`}
          note="Eligible appointments"
          icon={AlertTriangle}
          tone="gold"
        />
      </section>

      {/* NBA Contractual Eligibility & Compliance Notice */}
      <section className="rounded-md border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 p-4">
        <div className="flex items-start gap-3">
          <ShieldAlert className="size-5 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
          <div className="space-y-1.5 text-xs text-amber-900 dark:text-amber-200">
            <h3 className="font-bold text-sm text-amber-950 dark:text-amber-100 flex items-center gap-2">
              NBA Faculty Eligibility Verification Status (Section 4.1)
            </h3>
            <p>
              SmartSFR automatically evaluates faculty eligibility based on the attributes provided in the CSV dataset:
            </p>
            <ul className="list-disc pl-5 space-y-0.5">
              <li>
                <strong>Verified by Dataset:</strong> Full-time employment status (<code className="bg-amber-100 dark:bg-amber-900 px-1 py-0.5 rounded">full_time == "Yes"</code>),
                exclusion of first-year faculty (<code className="bg-amber-100 dark:bg-amber-900 px-1 py-0.5 rounded">first_year_faculty == "No"</code>), and
                appointment association (<code className="bg-amber-100 dark:bg-amber-900 px-1 py-0.5 rounded">Regular</code> or <code className="bg-amber-100 dark:bg-amber-900 px-1 py-0.5 rounded">Contractual</code>).
              </li>
              <li>
                <strong>Requires Institutional Verification:</strong> For Contractual faculty, NBA guidelines stipulate that they must be appointed through an open selection process, possess AICTE/UGC recommended qualifications and experience, and have served for a minimum of two consecutive semesters. Because these institutional compliance details are not captured in CSV columns, they are marked as <em>"Eligible in CSV (Pending institutional document verification)"</em>.
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Filters and Search Panel */}
      <section className="panel p-4 space-y-3">
        <div className="flex items-center justify-between">
          <PanelTitle icon={Filter}>Search & Filter Faculty Roster</PanelTitle>
          {(searchId || searchDesignation || selectedYear !== "ALL" || selectedAssoc !== "ALL" || selectedEligibility !== "ALL") && (
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-1">
          {/* Search ID */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
            <Input
              placeholder="Search Faculty ID..."
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              className="pl-9 text-xs h-10"
            />
          </div>

          {/* Search Designation */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
            <Input
              placeholder="Search Designation..."
              value={searchDesignation}
              onChange={(e) => setSearchDesignation(e.target.value)}
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

          {/* Association Filter */}
          <div>
            <select
              aria-label="Filter by Association"
              value={selectedAssoc}
              onChange={(e) => setSelectedAssoc(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-card px-3 py-2 text-xs shadow-sm ring-offset-background focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="ALL">All Associations</option>
              <option value="Regular">Regular</option>
              <option value="Contractual">Contractual</option>
            </select>
          </div>

          {/* Eligibility Filter */}
          <div>
            <select
              aria-label="Filter by Eligibility"
              value={selectedEligibility}
              onChange={(e) => setSelectedEligibility(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-card px-3 py-2 text-xs shadow-sm ring-offset-background focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="ALL">All Eligibility Statuses</option>
              <option value="ELIGIBLE">Eligible Only</option>
              <option value="INELIGIBLE">Ineligible Only</option>
            </select>
          </div>
        </div>

        {/* Filter stats bar */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 px-1">
          <span>
            Showing <strong>{filteredRecords.length}</strong> of <strong>{facultyRecords.length}</strong> faculty records
          </span>
          <div className="flex gap-4">
            <span className="text-success font-medium">
              Eligible in View: {filteredRecords.filter(f => f.is_eligible).length}
            </span>
            <span className="text-destructive font-medium">
              Ineligible in View: {filteredRecords.filter(f => !f.is_eligible).length}
            </span>
          </div>
        </div>
      </section>

      {/* Faculty Records Table */}
      <section className="panel p-4">
        <div className="overflow-x-auto rounded-md border border-border">
          <table className="w-full min-w-[760px] border-collapse text-center text-xs">
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
                  onClick={() => toggleSort("faculty_id")}
                  className="table-cell text-left cursor-pointer hover:bg-muted/80 select-none"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Faculty ID</span>
                    <ArrowUpDown className="size-3 text-muted-foreground" />
                  </div>
                </th>
                <th
                  onClick={() => toggleSort("designation")}
                  className="table-cell text-left cursor-pointer hover:bg-muted/80 select-none"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Designation</span>
                    <ArrowUpDown className="size-3 text-muted-foreground" />
                  </div>
                </th>
                <th
                  onClick={() => toggleSort("association")}
                  className="table-cell cursor-pointer hover:bg-muted/80 select-none"
                >
                  <div className="flex items-center justify-center gap-1.5">
                    <span>Association</span>
                    <ArrowUpDown className="size-3 text-muted-foreground" />
                  </div>
                </th>
                <th className="table-cell">Full-Time Status</th>
                <th className="table-cell">1st Year Faculty</th>
                <th
                  onClick={() => toggleSort("is_eligible")}
                  className="table-cell cursor-pointer hover:bg-muted/80 select-none"
                >
                  <div className="flex items-center justify-center gap-1.5">
                    <span>NBA Eligibility Status</span>
                    <ArrowUpDown className="size-3 text-muted-foreground" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.length > 0 ? (
                filteredRecords.map((record, index) => (
                  <tr
                    key={`${record.academic_year}-${record.faculty_id}-${index}`}
                    className={`border-t border-border transition-colors ${
                      record.is_eligible ? "bg-card hover:bg-muted/40" : "bg-destructive/5 hover:bg-destructive/10"
                    }`}
                  >
                    <td className="table-cell text-left font-semibold text-foreground">
                      {record.academic_year}
                    </td>
                    <td className="table-cell text-left font-mono font-medium text-foreground">
                      {record.faculty_id}
                    </td>
                    <td className="table-cell text-left font-medium">
                      {record.designation}
                    </td>
                    <td className="table-cell">
                      <Badge
                        variant="secondary"
                        className={
                          record.association === "Regular"
                            ? "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200 border-none"
                            : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200 border-none"
                        }
                      >
                        {record.association}
                      </Badge>
                    </td>
                    <td className="table-cell">
                      {record.full_time === "Yes" ? (
                        <span className="inline-flex items-center text-success font-medium">
                          <CheckCircle2 className="size-3.5 mr-1" />
                          Yes
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-destructive font-medium">
                          <XCircle className="size-3.5 mr-1" />
                          No
                        </span>
                      )}
                    </td>
                    <td className="table-cell">
                      {record.first_year_faculty === "No" ? (
                        <span className="text-muted-foreground font-medium">No (Dept)</span>
                      ) : (
                        <span className="text-amber-700 dark:text-amber-400 font-bold">Yes (1st Year)</span>
                      )}
                    </td>
                    <td className="table-cell">
                      {record.is_eligible ? (
                        <div className="flex items-center justify-center gap-1.5">
                          <Badge className="bg-success text-success-contrast border-none font-semibold text-[11px]">
                            Eligible
                          </Badge>
                          {record.association === "Contractual" && (
                            <span
                              title="Contractual faculty: verify 2 consecutive semesters & selection procedure from college records"
                              className="text-[10px] text-amber-600 dark:text-amber-400 cursor-help"
                            >
                              *
                            </span>
                          )}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center">
                          <Badge variant="destructive" className="font-semibold text-[11px]">
                            Ineligible
                          </Badge>
                          {record.ineligibility_reasons && record.ineligibility_reasons.length > 0 && (
                            <span className="text-[10px] text-destructive/80 mt-0.5 max-w-[200px] truncate" title={record.ineligibility_reasons.join(", ")}>
                              {record.ineligibility_reasons[0]}
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr className="border-t border-border bg-card">
                  <td colSpan={7} className="table-cell py-8 text-center text-muted-foreground">
                    No faculty records match the selected filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
            {filteredRecords.length > 0 && (
              <tfoot className="border-t-2 border-border bg-muted/40 font-bold">
                <tr>
                  <td colSpan={6} className="table-cell text-right pr-4">
                    Filtered Faculty:
                  </td>
                  <td className="table-cell text-center text-foreground font-extrabold">
                    {filteredRecords.length} records ({filteredRecords.filter(f => f.is_eligible).length} eligible)
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
