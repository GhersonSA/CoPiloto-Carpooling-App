import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";
  const cookieHeader = req.headers.get("cookie") || "";

  try {
    const res = await fetch(`${backendUrl}/api/vehicles/by-profile/${id}`, {
      method: "GET",
      headers: { "Content-Type": "application/json", Cookie: cookieHeader },
    });
    
    if (!res.ok) {
      console.log("Vehículo no encontrado para driver_profile_id:", id);
      return NextResponse.json({}, { status: res.status });
    }
    
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("Error proxy GET /api/vehicles/by-profile/[id]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}