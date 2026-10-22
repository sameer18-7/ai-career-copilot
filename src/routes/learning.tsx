import { createFileRoute, redirect } from "@tanstack/react-router";
import { LearningPage } from "@/components/career/app-pages";

const title = "Learning Path — AI Career Copilot";
const description =
  "See your skill gaps against market demand and follow an adaptive roadmap to become job ready.";

export const Route = createFileRoute("/learning")({
  beforeLoad: ({ context }) => {
    if (!context.session?.user) {
      throw redirect({ to: "/login", search: { callbackUrl: "/learning" } });
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
  component: LearningPage,
});
