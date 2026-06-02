import { NextResponse } from "next/server";
import { pricing } from "@/lib/swiftmint";

export function GET() {
  return NextResponse.json({
    pricing,
    note:
      "Final payout amounts are calculated at the moment of processing and confirmed before processing.",
  });
}
