from datetime import datetime
from database import supabase

def _insert_notification(user_id: str, transaction_id: str, notif_type: str, message: str):
    supabase.table("notifications").insert({
        "user_id": user_id,
        "transaction_id": transaction_id,
        "type": notif_type,
        "message": message,
        "is_read": False,
        "created_at": datetime.utcnow().isoformat(),
    }).execute()


def notify_status_change(user_id: str, txn_id: str, status: str, txn_details: dict):
    messages = {
        "confirmed": (
            "Your transaction has been confirmed. SwiftMint has received your payment "
            "and your order is being prepared for processing."
        ),
        "processing": (
            "Your transaction is now being processed. Your funds are being forwarded "
            "to the recipient's mobile wallet. You will receive a confirmation once complete."
        ),
        "completed": (
            "Your transaction has been completed successfully! The recipient has received "
            "the funds. Please confirm receipt on your dashboard."
        ),
        "sender_confirmed": (
            "Thank you! Your confirmation has been received. The transaction is now fully closed."
        ),
        "cancelled": (
            "Your transaction has been cancelled. If you believe this was a mistake, "
            "please contact SwiftMint Exchange on WhatsApp."
        ),
    }

    msg = messages.get(status)
    if msg:
        _insert_notification(user_id, txn_id, f"status_{status}", msg)

    if status == "completed":
        _insert_notification(user_id, txn_id, "receipt", _build_receipt_message(txn_details))


def notify_fund_credited(user_id: str, txn_id: str, amount: int):
    msg = (
        f"Your wallet has been credited with MK {amount:,.0f}. "
        f"The funds are now available for transfers. Reference: {txn_id[:8]}"
    )
    _insert_notification(user_id, txn_id, "fund_credited", msg)


def _build_receipt_message(txn: dict) -> str:
    lines = [
        "=== TRANSACTION RECEIPT ===",
        f"Reference: {txn.get('reference', 'N/A')}",
        f"Status: Completed",
        f"Amount sent: MK {txn.get('amount', 0):,.0f}",
        f"Fee: MK {txn.get('fee', 0):,.0f}",
        f"Payout: MK {txn.get('payout', 0):,.0f}",
    ]
    if txn.get("recipient_name"):
        lines.append(f"Recipient: {txn['recipient_name']}")
    if txn.get("country"):
        lines.append(f"Country: {txn['country']}")
    if txn.get("wallet_type"):
        lines.append(f"Wallet: {txn['wallet_type']}")
    if txn.get("recipient_number"):
        lines.append(f"Mobile: {txn['recipient_number']}")
    lines.extend([
        "",
        "Thank you for using SwiftMint Exchange.",
        "Premium Outbound Mobile Money Facilitation",
    ])
    return "\n".join(lines)


def build_whatsapp_receipt(txn: dict, whatsapp_number: str) -> str:
    lines = [
        "Hello SwiftMint Exchange,",
        "",
        "I have received a completed transaction and would like to confirm the payout.",
        "",
        "=== RECEIPT ===",
        f"Reference: {txn.get('reference', 'N/A')}",
        f"Amount sent: MK {txn.get('amount', 0):,.0f}",
        f"Fee: MK {txn.get('fee', 0):,.0f}",
        f"Payout: MK {txn.get('payout', 0):,.0f}",
    ]
    if txn.get("recipient_name"):
        lines.append(f"Recipient: {txn['recipient_name']}")
    if txn.get("country"):
        lines.append(f"Country: {txn['country']}")
    if txn.get("wallet_type"):
        lines.append(f"Wallet: {txn['wallet_type']}")
    if txn.get("recipient_number"):
        lines.append(f"Mobile: {txn['recipient_number']}")
    lines.append("")
    lines.append("Please confirm the recipient has received the funds.")
    return "\n".join(lines)


def build_status_whatsapp_message(txn: dict, status: str, whatsapp_number: str) -> str | None:
    if status == "completed":
        return build_whatsapp_receipt(txn, whatsapp_number)
    if status == "confirmed":
        return (
            f"Hello SwiftMint Exchange,\n\n"
            f"I am checking on my transaction {txn.get('reference', 'N/A')} "
            f"which has been confirmed. Please proceed with processing."
        )
    if status == "processing":
        return (
            f"Hello SwiftMint Exchange,\n\n"
            f"I am following up on my transaction {txn.get('reference', 'N/A')}. "
            f"Has the recipient received the funds?"
        )
    return None
