import { createFileRoute } from "@tanstack/react-router";
import { StudentDataView } from "@/components/student-data-view";

export const Route = createFileRoute("/student-data")({
  head: () => ({
    meta: [
      { title: "Student Data — SmartSFR NBA Compliance" },
      {
        name: "description",
        content: "View, filter and analyze student cohort datasets for NBA accreditation Section 4.1.",
      },
    ],
  }),
  component: StudentDataView,
});
