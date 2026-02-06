import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";
  const cookieHeader = req.headers.get("cookie") || "";

  try {
    const res = await fetch(`${backendUrl}/api/auth/me`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Cookie": cookieHeader,
      },
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Unauthorized" }));
      return NextResponse.json(err, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Error en proxy /api/auth/me:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
