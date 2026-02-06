import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";
  const cookieHeader = req.headers.get("cookie") || "";

  try {
    const body = await req.json();

    const res = await fetch(`${backendUrl}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Cookie": cookieHeader,
      },
      body: JSON.stringify(body),
    });

    const data = await res.json().catch(() => ({}));
    const response = NextResponse.json(data, { status: res.status });
    
    // Usar response.cookies.set() de Next.js para setear cookies correctamente
    const setCookies = res.headers.getSetCookie?.() || [];
    
    for (const cookieString of setCookies) {
      const parts = cookieString.split(';').map(p => p.trim());
      const [nameValue, ...options] = parts;
      const eqIndex = nameValue.indexOf('=');
      const name = nameValue.substring(0, eqIndex);
      const value = nameValue.substring(eqIndex + 1);
      
      const cookieOptions: {
        httpOnly?: boolean;
        secure?: boolean;
        sameSite?: 'lax' | 'strict' | 'none';
        path?: string;
        maxAge?: number;
      } = {};
      
      for (const opt of options) {
        const lower = opt.toLowerCase();
        if (lower === 'httponly') cookieOptions.httpOnly = true;
        else if (lower === 'secure') cookieOptions.secure = true;
        else if (lower.startsWith('samesite=')) {
          const val = opt.split('=')[1]?.toLowerCase();
          if (val === 'lax' || val === 'strict' || val === 'none') {
            cookieOptions.sameSite = val;
          }
        }
        else if (lower.startsWith('path=')) cookieOptions.path = opt.split('=')[1];
        else if (lower.startsWith('max-age=')) cookieOptions.maxAge = parseInt(opt.split('=')[1], 10);
      }
      
      response.cookies.set(name, value, cookieOptions);
    }
    
    // Fallback si getSetCookie no está disponible
    if (setCookies.length === 0) {
      const setCookie = res.headers.get("set-cookie");
      if (setCookie) {
        response.headers.set("set-cookie", setCookie);
      }
    }
    
    return response;
  } catch (error) {
    console.error("Error en proxy /api/auth/login:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
