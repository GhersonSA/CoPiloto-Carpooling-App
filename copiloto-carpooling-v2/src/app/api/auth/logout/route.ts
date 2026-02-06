import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";
  const cookieHeader = req.headers.get("cookie") || "";

  try {
    const res = await fetch(`${backendUrl}/api/auth/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Cookie": cookieHeader,
      },
      credentials: "include",
    });

    const data = await res.json().catch(() => ({ message: "Logout" }));
    const response = NextResponse.json(data, { status: res.status });
    const setCookie = res.headers.get("set-cookie");
    if (setCookie) {
      response.headers.set("set-cookie", setCookie);
    }
    return response;
  } catch (error) {
    console.error("Error en proxy /api/auth/logout:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
