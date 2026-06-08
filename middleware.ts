import { Auth0Client } from "@auth0/nextjs-auth0/server";
import { NextRequest, NextResponse } from "next/server";

const auth0 = new Auth0Client();

export async function middleware(request: NextRequest) {
  return auth0.middleware(request);
}

export const config = {
  matcher: "/auth/:path*",
};
