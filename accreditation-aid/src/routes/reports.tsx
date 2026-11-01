import { createFileRoute } from "@tanstack/react-router";
import { ReportsView } from "@/components/reports-view";

export const Route = createFileRoute("/reports")({
  head: () => ({
    meta: [
      { title: "Reports — SmartSFR NBA Accreditation Support" },
      {
        name: "description",
        content: "Generate and export NBA Section 4.1 Student-Faculty Ratio Compliance Reports in PDF and Excel/CSV.",
      },
    ],
  }),
  component: ReportsView,
});
