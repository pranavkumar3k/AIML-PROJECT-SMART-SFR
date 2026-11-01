import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
  type ChangeEvent,
} from "react";

export type FileKind = "student" | "faculty";

export type YearlyResult = {
  academic_year: string;
  ug2_students: number;
  ug3_students: number;
  ug4_students: number;
  pg1_students: number;
  pg2_students: number;
  total_students: number;
  faculty_count: number;
  regular_faculty_count?: number;
  contractual_faculty_count?: number;
  ineligible_faculty_count?: number;
  total_faculty_in_year?: number;
  formula_display?: string;
  sfr: number;
};

export type StudentRecord = {
  academic_year: string;
  program: string;
  program_type: string;
  year_of_study: number;
  student_count: number;
};

export type FacultyRecord = {
  academic_year: string;
  faculty_id: string;
  designation: string;
  association: string;
  full_time: string;
  first_year_faculty: string;
  is_eligible: boolean;
  ineligibility_reasons: string[];
  nba_verification_status: string;
};

export type StudentSummary = {
  total_records: number;
  total_students: number;
  ug_students: number;
  pg_students: number;
  years: string[];
};

export type FacultySummary = {
  total_faculty: number;
  eligible_faculty: number;
  ineligible_faculty: number;
  regular_eligible_faculty: number;
  contractual_eligible_faculty: number;
};

export type AnalysisResult = {
  yearly_results: {
    CAY: YearlyResult;
    CAYm1: YearlyResult;
    CAYm2: YearlyResult;
  };
  average_sfr: number;
  marks: number;
  threshold_applied?: string;
  student_records?: StudentRecord[];
  faculty_records?: FacultyRecord[];
  student_summary?: StudentSummary;
  faculty_summary?: FacultySummary;
};

export type FilesMeta = {
  student: {
    name: string;
    records: number;
  };
  faculty: {
    name: string;
    records: number;
  };
};

export type SfrContextType = {
  files: FilesMeta;
  selectedFiles: {
    student: File | null;
    faculty: File | null;
  };
  analysis: AnalysisResult | null;
  analysisState: "idle" | "loading" | "complete";
  error: string | null;
  runAnalysis: (overrideStudent?: File, overrideFaculty?: File) => Promise<void>;
  loadSampleData: () => Promise<void>;
  onFileChange: (kind: FileKind, event: ChangeEvent<HTMLInputElement>) => void;
  resetAll: () => void;
};

const SfrContext = createContext<SfrContextType | null>(null);

const SESSION_STORAGE_KEY = "smartsfr_analysis_data";
const SESSION_STORAGE_FILES = "smartsfr_files_meta";

const DEFAULT_FILES: FilesMeta = {
  student: {
    name: "dummy_student_data.csv",
    records: 15,
  },
  faculty: {
    name: "dummy_faculty_data.csv",
    records: 12,
  },
};

export function SfrProvider({ children }: { children: ReactNode }) {
  const [files, setFiles] = useState<FilesMeta>(DEFAULT_FILES);
  const [selectedFiles, setSelectedFiles] = useState<{
    student: File | null;
    faculty: File | null;
  }>({
    student: null,
    faculty: null,
  });

  const [analysisState, setAnalysisState] = useState<"idle" | "loading" | "complete">("idle");
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Hydrate persisted analysis on mount (browser only)
  useEffect(() => {
    try {
      if (typeof window !== "undefined" && window.sessionStorage) {
        const storedAnalysis = window.sessionStorage.getItem(SESSION_STORAGE_KEY);
        const storedFiles = window.sessionStorage.getItem(SESSION_STORAGE_FILES);
        if (storedAnalysis) {
          const parsed = JSON.parse(storedAnalysis);
          setAnalysis(parsed);
          setAnalysisState("complete");
        }
        if (storedFiles) {
          setFiles(JSON.parse(storedFiles));
        }
      }
    } catch (e) {
      console.warn("Unable to restore SmartSFR session state:", e);
    }
  }, []);

  const persistState = (newAnalysis: AnalysisResult | null, newFiles: FilesMeta) => {
    try {
      if (typeof window !== "undefined" && window.sessionStorage) {
        if (newAnalysis) {
          window.sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(newAnalysis));
        } else {
          window.sessionStorage.removeItem(SESSION_STORAGE_KEY);
        }
        window.sessionStorage.setItem(SESSION_STORAGE_FILES, JSON.stringify(newFiles));
      }
    } catch (e) {
      console.warn("Failed to persist analysis in session storage:", e);
    }
  };

  const onFileChange = (kind: FileKind, event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setSelectedFiles((prev) => ({
      ...prev,
      [kind]: file,
    }));

    setFiles((prev) => {
      const updated = {
        ...prev,
        [kind]: {
          name: file.name,
          records: 0, // Will be known after analysis
        },
      };
      persistState(analysis, updated);
      return updated;
    });

    setAnalysisState("idle");
    setError(null);
  };

  const runAnalysis = async (overrideStudent?: File, overrideFaculty?: File) => {
    const studentToUse = overrideStudent || selectedFiles.student;
    const facultyToUse = overrideFaculty || selectedFiles.faculty;

    if (!studentToUse || !facultyToUse) {
      setError("Please select both student and faculty CSV files to run analysis.");
      return;
    }

    setAnalysisState("loading");
    setError(null);

    try {
      const formData = new FormData();
      formData.append("student_file", studentToUse);
      formData.append("faculty_file", facultyToUse);

      const response = await fetch("http://127.0.0.1:8000/analyze", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        let errorMsg = "Analysis failed.";
        try {
          const errJson = await response.json();
          if (errJson.detail) {
            if (typeof errJson.detail === "string") {
              errorMsg = errJson.detail;
            } else if (errJson.detail.message) {
              errorMsg = `${errJson.detail.message} Missing: ${(errJson.detail.missing_columns || []).join(", ")}`;
            }
          }
        } catch {
          const text = await response.text();
          if (text) errorMsg = text;
        }
        throw new Error(errorMsg);
      }

      const result: AnalysisResult = await response.json();

      const updatedFiles: FilesMeta = {
        student: {
          name: studentToUse.name,
          records: result.student_records?.length ?? result.student_summary?.total_records ?? 0,
        },
        faculty: {
          name: facultyToUse.name,
          records: result.faculty_records?.length ?? result.faculty_summary?.total_faculty ?? 0,
        },
      };

      setFiles(updatedFiles);
      setAnalysis(result);
      setAnalysisState("complete");
      persistState(result, updatedFiles);
    } catch (err) {
      console.error(err);
      setAnalysisState("idle");
      setError(
        err instanceof Error
          ? err.message
          : "Unable to connect to the SmartSFR backend."
      );
    }
  };

  const loadSampleData = async () => {
    setAnalysisState("loading");
    setError(null);

    try {
      const response = await fetch("http://127.0.0.1:8000/sample-analysis");
      if (!response.ok) {
        throw new Error("Failed to load sample dataset from backend.");
      }

      const result: AnalysisResult = await response.json();

      const sampleFiles: FilesMeta = {
        student: {
          name: "dummy_student_data.csv",
          records: result.student_records?.length ?? 15,
        },
        faculty: {
          name: "dummy_faculty_data.csv",
          records: result.faculty_records?.length ?? 12,
        },
      };

      setFiles(sampleFiles);
      setAnalysis(result);
      setAnalysisState("complete");
      persistState(result, sampleFiles);
    } catch (err) {
      console.error(err);
      setAnalysisState("idle");
      setError(
        err instanceof Error
          ? err.message
          : "Unable to connect to the SmartSFR backend."
      );
    }
  };

  const resetAll = () => {
    setAnalysis(null);
    setAnalysisState("idle");
    setError(null);
    setSelectedFiles({ student: null, faculty: null });
    setFiles(DEFAULT_FILES);
    persistState(null, DEFAULT_FILES);
  };

  return (
    <SfrContext.Provider
      value={{
        files,
        selectedFiles,
        analysis,
        analysisState,
        error,
        runAnalysis,
        loadSampleData,
        onFileChange,
        resetAll,
      }}
    >
      {children}
    </SfrContext.Provider>
  );
}

export function useSfr() {
  const context = useContext(SfrContext);
  if (!context) {
    throw new Error("useSfr must be used within a SfrProvider");
  }
  return context;
}
