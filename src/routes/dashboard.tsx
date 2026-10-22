import { createFileRoute, redirect } from "@tanstack/react-router";
import { DashboardPage } from "@/components/career/app-pages";

const title = "Career Dashboard — AI Career Copilot";
const description =
  "Track your ATS score, skill gaps, applications and interview performance in one career command center.";

export const Route = createFileRoute("/dashboard")({
  // ── Server-side authentication guard ────────────────────────────────────
  // beforeLoad runs on the server (SSR) and on client navigation.
  // session is injected by __root.tsx's beforeLoad via route context.
  beforeLoad: ({ context }) => {
    if (!context.session?.user) {
      throw redirect({ to: "/login", search: { callbackUrl: "/dashboard" } });
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
  component: DashboardPage,
});
