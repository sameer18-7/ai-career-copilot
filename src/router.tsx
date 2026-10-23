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

  // Polyfill iterator on getMatchedRoutes return value so @tanstack/start-server-core
  // (which expects [matchedRoutes, rawParams, foundRoute]) can destructure it cleanly.
  const origGetMatchedRoutes = router.getMatchedRoutes.bind(router);
  router.getMatchedRoutes = ((pathname: string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = origGetMatchedRoutes(pathname) as any;
    if (res && typeof res === "object" && !(Symbol.iterator in res)) {
      res[Symbol.iterator] = function* () {
        yield res.matchedRoutes;
        yield res.routeParams;
        yield res.foundRoute;
      };
    }
    return res;
  }) as typeof router.getMatchedRoutes;

  // Ensure router.serverSsr has all expected SSR helper functions
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function ensureServerSsrHelpers(val: any) {
    if (val && typeof val === "object") {
      if (typeof val.takeBufferedScripts !== "function") val.takeBufferedScripts = () => undefined;
      if (typeof val.reserveStreamFastPath !== "function") val.reserveStreamFastPath = () => true;
      if (typeof val.setRenderFinished !== "function") val.setRenderFinished = () => {};
      if (typeof val.onRenderFinished !== "function") val.onRenderFinished = () => {};
      if (typeof val.onInjectedHtml !== "function") val.onInjectedHtml = () => () => {};
      if (typeof val.onSerializationFinished !== "function") val.onSerializationFinished = () => () => {};
      if (typeof val.isSerializationFinished !== "function") val.isSerializationFinished = () => true;
      if (typeof val.liftScriptBarrier !== "function") val.liftScriptBarrier = () => {};
      if (typeof val.takeBufferedHtml !== "function") val.takeBufferedHtml = () => undefined;
      if (typeof val.onCleanup !== "function") val.onCleanup = () => {};
      if (typeof val.cleanup !== "function") val.cleanup = () => {};
      if (typeof val.dehydrate !== "function") val.dehydrate = async () => {};
    }
    return val;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let _serverSsr: any = ensureServerSsrHelpers((router as any).serverSsr);
  Object.defineProperty(router, "serverSsr", {
    get() {
      return ensureServerSsrHelpers(_serverSsr);
    },
    set(val) {
      _serverSsr = ensureServerSsrHelpers(val);
    },
    configurable: true,
    enumerable: true,
  });

  return router;
};
