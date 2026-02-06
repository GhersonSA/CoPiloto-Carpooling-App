import { NextRequest, NextResponse } from "next/server";

const backend = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const cookieHeader = req.headers.get("cookie") || "";
  try {
    const body = await req.json();
    const res = await fetch(`${backend}/api/routes/${params.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Cookie: cookieHeader },
      credentials: "include",
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (e) {
    console.error("Proxy PUT /api/routes/[id]", e);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const cookieHeader = req.headers.get("cookie") || "";
  try {
    const res = await fetch(`${backend}/api/routes/${params.id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json", Cookie: cookieHeader },
      credentials: "include",
    });
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (e) {
    console.error("Proxy DELETE /api/routes/[id]", e);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}