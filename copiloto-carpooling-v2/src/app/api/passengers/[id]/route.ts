import { NextRequest, NextResponse } from "next/server";

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const cookieHeader = req.headers.get("cookie") || "";

  try {
    const res = await fetch(`${backendUrl}/api/passengers/${id}`, {
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
    console.error("Error en proxy GET /api/passengers/:id:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const cookieHeader = req.headers.get("cookie") || "";

  try {
    const body = await req.json();

    const res = await fetch(`${backendUrl}/api/passengers/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieHeader,
      },
      body: JSON.stringify(body),
    });

    const data = await res.json().catch(() => ({}));
    const response = NextResponse.json(data, { status: res.status });
    const setCookie = res.headers.get("set-cookie");
    if (setCookie) response.headers.set("set-cookie", setCookie);
    return response;
  } catch (error) {
    console.error("Error en proxy PUT /api/passengers/:id:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const cookieHeader = req.headers.get("cookie") || "";

  try {
    const res = await fetch(`${backendUrl}/api/passengers/${id}`, {
      method: "DELETE",
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
    console.error("Error en proxy DELETE /api/passengers/:id:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
