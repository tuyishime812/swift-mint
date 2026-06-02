import { NextResponse } from "next/server";
import {
  buildWhatsAppMessage,
  buildWhatsAppUrl,
  type TransferRequestInput,
  validateTransferRequest,
} from "@/lib/swiftmint";

function normalizeBody(body: unknown): TransferRequestInput {
  const input = body as Partial<TransferRequestInput>;

  return {
    country: String(input.country ?? "").trim(),
    recipientName: String(input.recipientName ?? "").trim(),
    walletType: String(input.walletType ?? "").trim(),
    recipientNumber: String(input.recipientNumber ?? "").trim(),
    amount: String(input.amount ?? "").trim(),
  };
}

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { errors: { country: "Send a valid JSON request body." } },
      { status: 400 },
    );
  }

  const input = normalizeBody(body);
  const validation = validateTransferRequest(input);

  if (!validation.valid) {
    return NextResponse.json({ errors: validation.errors }, { status: 400 });
  }

  const previewMessage = buildWhatsAppMessage(input);

  return NextResponse.json({
    request: input,
    previewMessage,
    whatsappUrl: buildWhatsAppUrl(previewMessage),
  });
}
