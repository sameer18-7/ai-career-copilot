import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const queryClient = new QueryClient();

  const router = createRouter({
    routeTree,
    // session is populated dynamically by __root.tsx's beforeLoad.
    // It must be present in the initial context to satisfy the type contract
    // even though it starts as null (before the first getSession() call).
    context: { queryClient, session: null },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
  });

  return router;
};
