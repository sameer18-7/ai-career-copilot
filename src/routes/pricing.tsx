import { createFileRoute } from "@tanstack/react-router";
import { PricingPage } from "@/components/career/more-pages";

const title = "Pricing — AI Career Copilot";
const description = "Start free as a student, upgrade to Pro for unlimited AI coaching, or bring Copilot to your campus.";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: PricingPage,
});
