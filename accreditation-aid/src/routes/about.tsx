import { createFileRoute } from "@tanstack/react-router";
import { AboutView } from "@/components/about-view";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About SmartSFR — NBA Accreditation Support" },
      {
        name: "description",
        content: "Overview of SmartSFR, NBA Chapter 4 Section 4.1 methodology, and SFR calculation guidelines.",
      },
    ],
  }),
  component: AboutView,
});
