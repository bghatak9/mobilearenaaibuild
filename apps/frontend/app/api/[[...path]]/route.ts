import type { NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function backendBase(): string {
  return (
    process.env.BACKEND_URL?.replace(/\/$/, "") ||
    process.env.INTERNAL_API_URL?.replace(/\/$/, "") ||
    "http://localhost:4000"
  );
}

function toNextResponse(upstream: Response): Response {
  const responseHeaders = new Headers(upstream.headers);
  responseHeaders.delete("transfer-encoding");

  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: responseHeaders,
  });
}

function backendUnreachableResponse(): Response {
  return new Response(
    JSON.stringify({
      message:
        "Backend unreachable. Start it with: npm run dev:backend (port 4000)",
      statusCode: 503,
    }),
    {
      status: 503,
      headers: { "content-type": "application/json" },
    },
  );
}

async function proxyRequest(request: NextRequest, path: string[] = []) {
  const targetPath = path.join("/");
  const url = `${backendBase()}/${targetPath}${request.nextUrl.search}`;
  const method = request.method;
  const auth = request.headers.get("authorization");
  const contentType = request.headers.get("content-type") ?? "";

  const authHeaders = new Headers();
  if (auth) authHeaders.set("authorization", auth);

  try {
    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const upstream = await fetch(url, {
        method,
        headers: authHeaders,
        body: formData,
      });
      return toNextResponse(upstream);
    }

    if (method === "GET" || method === "HEAD") {
      const upstream = await fetch(url, {
        method,
        headers: authHeaders,
        redirect: "manual",
      });
      return toNextResponse(upstream);
    }

    const forwardHeaders = new Headers(request.headers);
    forwardHeaders.delete("host");
    forwardHeaders.delete("connection");

    const upstream = await fetch(url, {
      method,
      headers: forwardHeaders,
      body: request.body,
      duplex: "half",
    } as RequestInit & { duplex: "half" });

    return toNextResponse(upstream);
  } catch {
    return backendUnreachableResponse();
  }
}

type RouteContext = { params: Promise<{ path?: string[] }> };

async function resolvePath(context: RouteContext): Promise<string[]> {
  const { path } = await context.params;
  return path ?? [];
}

export async function GET(request: NextRequest, context: RouteContext) {
  return proxyRequest(request, await resolvePath(context));
}

export async function POST(request: NextRequest, context: RouteContext) {
  return proxyRequest(request, await resolvePath(context));
}

export async function PUT(request: NextRequest, context: RouteContext) {
  return proxyRequest(request, await resolvePath(context));
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  return proxyRequest(request, await resolvePath(context));
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  return proxyRequest(request, await resolvePath(context));
}

export async function OPTIONS(request: NextRequest, context: RouteContext) {
  return proxyRequest(request, await resolvePath(context));
}
