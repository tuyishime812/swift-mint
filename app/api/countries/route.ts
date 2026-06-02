import { NextResponse } from "next/server";
import { countries } from "@/lib/swiftmint";

export function GET() {
  return NextResponse.json({
    countries,
  });
}
