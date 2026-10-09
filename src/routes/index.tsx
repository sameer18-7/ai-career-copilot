import { createFileRoute } from "@tanstack/react-router";
import { HomePage } from "@/components/career/marketing";

const title = "AI Career Copilot — Land Your Dream Job with AI";
const description =
  "Analyze your resume, close skill gaps, practice interviews and match with the right roles — one AI career platform for students.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: HomePage,
});
