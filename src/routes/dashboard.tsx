import { createFileRoute } from "@tanstack/react-router";
import { DashboardPage } from "@/components/career/app-pages";

const title = "Career Dashboard — AI Career Copilot";
const description = "Track your ATS score, skill gaps, applications and interview performance in one career command center.";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: DashboardPage,
});
