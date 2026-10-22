import { createFileRoute } from "@tanstack/react-router";
import { AuthPage } from "@/components/career/more-pages";
import { z } from "zod";

const title = "Log In — AI Career Copilot";
const description =
  "Log in to your AI Career Copilot account and continue your resume, learning and interview progress.";

// Validate/sanitize the callbackUrl search param so we never redirect to
// an external domain after login.
const loginSearchSchema = z.object({
  callbackUrl: z
    .string()
    .optional()
    .transform((url) => {
      if (!url) return "/dashboard";
      // Only allow relative paths (starting with /) — block external redirects.
      try {
        const parsed = new URL(url, "http://localhost");
        // If the host differs from our base, reject it.
        if (parsed.host !== "localhost") return "/dashboard";
        return parsed.pathname + parsed.search;
      } catch {
        return "/dashboard";
      }
    }),
});

export const Route = createFileRoute("/login")({
  validateSearch: loginSearchSchema,
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
