import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";
  const cookieHeader = req.headers.get("cookie") || "";

  try {
    const formData = await req.formData();
    
    // El backend usa /api/upload-image (el prefijo /api se agrega automáticamente)
    const res = await fetch(`${backendUrl}/api/upload-image`, {
      method: "POST",
      headers: { Cookie: cookieHeader },
      body: formData,
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Error del backend:", res.status, errorText);
      return NextResponse.json({ error: errorText || "Error al subir imagen" }, { status: res.status });
    }

    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("Error en proxy /api/upload-image:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}