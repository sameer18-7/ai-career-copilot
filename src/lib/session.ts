import { createServerFn } from "@tanstack/react-start";

// Server function to fetch the current Auth.js session.
// createServerFn produces an RPC bridge — the handler body runs on the server,
// but the function itself can be safely imported from client code.
export const getSession = createServerFn().handler(async () => {
  try {
    // Dynamic imports keep server-only modules out of the client bundle.
    const { getRequest } = await import("@tanstack/react-start/server");
    const { Auth } = await import("@auth/core");
    const { authConfig } = await import("./auth");

    let request: Request | undefined;
    try {
      request = getRequest();
    } catch {
      return null;
    }
    if (!request) return null;

    const url = new URL("/api/auth/session", request.url);
    const sessionReq = new Request(url, { headers: request.headers });
    const response = await Auth(sessionReq, authConfig);
    if (!response || !response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error("Failed to retrieve auth session:", error);
    return null;
  }
});
