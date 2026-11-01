import { createFileRoute } from "@tanstack/react-router";
import { SmartSfrDashboard } from "@/components/smart-sfr-dashboard";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SmartSFR — NBA Student-Faculty Ratio Analysis" },
      {
        name: "description",
        content: "Calculate and validate Student-Faculty Ratio for NBA accreditation Section 4.1.",
      },
      { property: "og:title", content: "SmartSFR — NBA Student-Faculty Ratio Analysis" },
      {
        property: "og:description",
        content: "Calculate and validate Student-Faculty Ratio for NBA accreditation Section 4.1.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SmartSfrDashboard,
});
