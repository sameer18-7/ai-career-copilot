import { createFileRoute } from "@tanstack/react-router";
import { JobsPage } from "@/components/career/more-pages";

const title = "Job Matches — AI Career Copilot";
const description = "Discover roles ranked by your skills, goals, salary expectations and interview readiness.";

export const Route = createFileRoute("/jobs")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: JobsPage,
});
