import "./lib/error-capture";

// Validate required environment variables at startup.
// In production this throws and prevents the server from starting with missing secrets.
// In development it logs a clear error but continues to allow hot-reload fixes.
import { assertEnvValid } from "./lib/env-validation";
assertEnvValid();

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";
import { createStartHandler, defaultStreamHandler } from "@tanstack/react-start/server";

const startHandler = createStartHandler(defaultStreamHandler);

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isH3SwallowedErrorBody(body)) return response;

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isH3SwallowedErrorBody(body: string): boolean {
  try {
    const payload = JSON.parse(body) as { unhandled?: unknown; message?: unknown };
    return payload.unhandled === true && payload.message === "HTTPError";
  } catch {
    return false;
  }
}

export default {
  async fetch(request: Request, env?: unknown, ctx?: unknown) {
    try {
      const url = new URL(request.url);
      if (url.pathname.startsWith("/api/auth")) {
        const { Auth } = await import("@auth/core");
        const { authConfig } = await import("./lib/auth");
        return await Auth(request, authConfig);
      }

      // env is the Cloudflare Workers / Vite runtime environment object.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response = await startHandler(request, env as any);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      // Never expose internal error details in the HTTP response body.
      console.error(error);
      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};
