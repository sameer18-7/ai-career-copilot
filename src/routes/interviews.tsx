import { createFileRoute } from "@tanstack/react-router";
import { InterviewsPage } from "@/components/career/more-pages";

const title = "Interview Coach — AI Career Copilot";
const description = "Run role-specific mock interviews and get instant AI feedback on clarity, structure and depth.";

export const Route = createFileRoute("/interviews")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: InterviewsPage,
});
