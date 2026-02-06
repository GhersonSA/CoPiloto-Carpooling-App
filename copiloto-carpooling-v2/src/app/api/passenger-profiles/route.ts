import { NextRequest, NextResponse } from "next/server";

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";

export async function GET(req: NextRequest) {
  const cookieHeader = req.headers.get("cookie") || "";

  try {
    const res = await fetch(`${backendUrl}/api/passenger-profiles`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieHeader,
      },
    });

    const data = await res.json().catch(() => ({}));
    const response = NextResponse.json(data, { status: res.status });
    const setCookie = res.headers.get("set-cookie");
    if (setCookie) response.headers.set("set-cookie", setCookie);
    return response;
  } catch (error) {
    console.error("Error en proxy GET /api/passenger-profiles:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
