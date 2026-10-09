import { createFileRoute } from "@tanstack/react-router";
import { FeaturesPage } from "@/components/career/more-pages";

const title = "Features — AI Career Copilot";
const description =
  "Resume analyzer, skill gap analysis, adaptive learning paths, interview coaching and ranked job matching in one platform.";

export const Route = createFileRoute("/features")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: FeaturesPage,
});
