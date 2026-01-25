import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import { getToken } from "next-auth/jwt";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  try {
    const debug: any = {
      timestamp: new Date().toISOString(),
      hasRequest: !!request,
      cookieHeader: request.headers.get('cookie') || 'NONE',
      cookies: [] as string[],
      authResult: null as any,
      tokenResult: null as any,
    };

    // Try auth()
    try {
      const session = await auth();
      debug.authResult = {
        hasSession: !!session,
        userId: session?.user?.id || null,
        userEmail: session?.user?.email || null,
      };
    } catch (authError: any) {
      debug.authResult = {
        error: authError.message,
        stack: authError.stack,
      };
    }

    // Try reading cookies
    try {
      const cookieStore = await cookies();
      const allCookies = cookieStore.getAll();
      debug.cookies = allCookies.map(c => ({
        name: c.name,
        hasValue: !!c.value,
        valueLength: c.value?.length || 0,
        valuePreview: c.value ? `${c.value.substring(0, 20)}...` : null,
      }));
    } catch (cookieError: any) {
      debug.cookieError = cookieError.message;
    }

    // Try getToken
    try {
      const cookieHeader = request.headers.get('cookie') || '';
      if (cookieHeader) {
        const token = await getToken({
          req: {
            headers: {
              cookie: cookieHeader,
            },
          } as any,
          secret: process.env.NEXTAUTH_SECRET,
        });
        debug.tokenResult = {
          hasToken: !!token,
          userId: token?.id || null,
          tokenKeys: token ? Object.keys(token) : [],
        };
      } else {
        debug.tokenResult = { error: "No cookie header" };
      }
    } catch (tokenError: any) {
      debug.tokenError = tokenError.message;
    }

    // Check for specific cookie names
    const cookieHeader = request.headers.get('cookie') || '';
    debug.cookieChecks = {
      hasAuthjsCookie: cookieHeader.includes('authjs.session-token'),
      hasSecureAuthjsCookie: cookieHeader.includes('__Secure-authjs.session-token'),
      hasNextAuthCookie: cookieHeader.includes('next-auth.session-token'),
      hasAnyAuthCookie: cookieHeader.includes('session-token'),
    };

    debug.env = {
      hasSecret: !!process.env.NEXTAUTH_SECRET,
      secretLength: process.env.NEXTAUTH_SECRET?.length || 0,
    };

    return NextResponse.json(debug, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({
      error: error.message,
      stack: error.stack,
    }, { status: 500 });
  }
}
