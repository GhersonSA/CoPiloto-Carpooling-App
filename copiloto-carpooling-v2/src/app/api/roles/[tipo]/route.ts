import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ tipo: string }> }
) {
  const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";
  const cookieHeader = req.headers.get("cookie") || "";
  const { tipo } = await params;

  try {
    const res = await fetch(`${backendUrl}/api/roles/${tipo}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "Cookie": cookieHeader,
      },
      credentials: "include",
    });

    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error(`Error en proxy DELETE /api/roles/${tipo}:`, error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
