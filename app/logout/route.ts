// app/logout/route.ts

import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

function must(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing ${name}`);
  return v;
}

export async function GET() {
  const cookieStore = await cookies();

  // Create the response first so we can set cookies on it.
  const res = NextResponse.redirect(new URL("/login", must("NEXT_PUBLIC_SITE_URL")));

  const supabase = createServerClient(
    must("NEXT_PUBLIC_SUPABASE_URL"),
    must("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            res.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  await supabase.auth.signOut();

  return res;
}
