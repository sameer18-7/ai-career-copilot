import { createFileRoute } from "@tanstack/react-router";
import { AuthPage } from "@/components/career/more-pages";

const title = "Log In — AI Career Copilot";
const description = "Log in to your AI Career Copilot account and continue your resume, learning and interview progress.";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: () => <AuthPage mode="login" />,
});
