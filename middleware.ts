import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

function must(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing ${name}`);
  return v;
}

function isOpsPath(pathname: string): boolean {
  return pathname === "/ops" || pathname.startsWith("/ops/");
}

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const { pathname } = req.nextUrl;

  const supabase = createServerClient(
    must("NEXT_PUBLIC_SUPABASE_URL"),
    must("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            res.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // Refresh session cookie when needed (also gives us the current user deterministically).
  const { data: userData, error: userErr } = await supabase.auth.getUser();
  const user = userData?.user ?? null;

  // Hard-lock all /ops routes to admin only (404 for non-admin / unauthenticated).
  if (isOpsPath(pathname)) {
    if (userErr || !user) {
      return new NextResponse("Not Found", { status: 404 });
    }

    const { data: profile, error: profileErr } = await supabase
      .from("profiles")
      .select("role")
      .eq("user_id", user.id)
      .maybeSingle();

    const isAdmin = !profileErr && profile?.role === "admin";

    if (!isAdmin) {
      return new NextResponse("Not Found", { status: 404 });
    }
  }

  return res;
}

// Avoid running middleware on static assets
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};
