import { NextRequest, NextResponse } from "next/server";

const backend = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";

export async function GET(req: NextRequest) {
  const cookieHeader = req.headers.get("cookie") || "";
  try {
    const res = await fetch(`${backend}/api/routes/mis-rutas`, {
      method: "GET",
      headers: { "Content-Type": "application/json", Cookie: cookieHeader },
      credentials: "include",
    });
    const data = await res.json().catch(() => []);
    return NextResponse.json(data, { status: res.status });
  } catch (e) {
    console.error("Proxy GET /api/routes/mis-rutas", e);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
