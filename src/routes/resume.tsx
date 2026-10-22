import { createFileRoute, redirect } from "@tanstack/react-router";
import { ResumePage } from "@/components/career/app-pages";

const title = "Resume Analyzer — AI Career Copilot";
const description =
  "Upload your resume for an instant ATS score, keyword analysis and AI rewrite suggestions.";

export const Route = createFileRoute("/resume")({
  // ── Server-side authentication guard ────────────────────────────────────
  beforeLoad: ({ context }) => {
    if (!context.session?.user) {
      throw redirect({ to: "/login", search: { callbackUrl: "/resume" } });
    }
  },
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: ResumePage,
});
