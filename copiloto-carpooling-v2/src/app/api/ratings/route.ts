import { NextRequest, NextResponse } from "next/server";

const backend = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";

export async function GET(req: NextRequest) {
  const cookieHeader = req.headers.get("cookie") || "";
  const query = req.nextUrl.search;
  try {
    const res = await fetch(`${backend}/api/ratings${query}`, {
      method: "GET",
      headers: { "Content-Type": "application/json", Cookie: cookieHeader },
      credentials: "include",
    });
    const data = await res.json().catch(() => []);
    return NextResponse.json(data, { status: res.status });
  } catch (e) {
    console.error("Proxy GET /api/ratings", e);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const cookieHeader = req.headers.get("cookie") || "";
  try {
    const body = await req.json();
    const res = await fetch(`${backend}/api/ratings`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: cookieHeader },
      credentials: "include",
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (e) {
    console.error("Proxy POST /api/ratings", e);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
