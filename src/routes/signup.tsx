import { createFileRoute } from "@tanstack/react-router";
import { AuthPage } from "@/components/career/more-pages";

const title = "Sign Up Free — AI Career Copilot";
const description = "Create a free account to analyze your resume, close skill gaps and match with the right roles.";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: () => <AuthPage mode="signup" />,
});
