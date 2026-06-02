import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({
    service: "SwiftMint Exchange frontend",
    status: "ok",
  });
}
