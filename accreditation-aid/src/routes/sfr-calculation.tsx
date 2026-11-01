import { createFileRoute } from "@tanstack/react-router";
import { SfrCalculationView } from "@/components/sfr-calculation-view";

export const Route = createFileRoute("/sfr-calculation")({
  head: () => ({
    meta: [
      { title: "SFR Calculation — SmartSFR NBA Compliance" },
      {
        name: "description",
        content: "Detailed breakdown of Student-Faculty Ratio and NBA Section 4.1 marks calculation.",
      },
    ],
  }),
  component: SfrCalculationView,
});
