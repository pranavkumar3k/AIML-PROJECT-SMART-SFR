import { createFileRoute } from "@tanstack/react-router";
import { FacultyDataView } from "@/components/faculty-data-view";

export const Route = createFileRoute("/faculty-data")({
  head: () => ({
    meta: [
      { title: "Faculty Data — SmartSFR NBA Compliance" },
      {
        name: "description",
        content: "Audit faculty roster and verify NBA Chapter 4 Section 4.1 eligibility criteria.",
      },
    ],
  }),
  component: FacultyDataView,
});
