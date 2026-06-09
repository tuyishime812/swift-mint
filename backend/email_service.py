import os
import resend

resend.api_key = os.getenv("RESEND_API_KEY", "")

FROM_EMAIL = "SwiftMint Exchange <onboarding@resend.dev>"


def send_order_placed_email(user_email: str, user_name: str, recipient_name: str, country: str, amount: float, fee: float, reference: str):
    if not resend.api_key:
        return

    total = amount + fee

    resend.Emails.send({
        "from": FROM_EMAIL,
        "to": [user_email],
        "subject": f"Order Placed — {reference}",
        "html": f"""
<div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
  <h2 style="color:#1a1a2e;">Order Placed</h2>
  <p>Hi {user_name},</p>
  <p>Your transfer order has been submitted and is pending confirmation.</p>
  <table style="width:100%;border-collapse:collapse;margin:16px 0;">
    <tr><td style="padding:8px;border-bottom:1px solid #eee;color:#666;">Reference</td><td style="padding:8px;border-bottom:1px solid #eee;font-weight:700;">{reference}</td></tr>
    <tr><td style="padding:8px;border-bottom:1px solid #eee;color:#666;">Recipient</td><td style="padding:8px;border-bottom:1px solid #eee;">{recipient_name}</td></tr>
    <tr><td style="padding:8px;border-bottom:1px solid #eee;color:#666;">Country</td><td style="padding:8px;border-bottom:1px solid #eee;">{country}</td></tr>
    <tr><td style="padding:8px;border-bottom:1px solid #eee;color:#666;">Amount</td><td style="padding:8px;border-bottom:1px solid #eee;">MK {amount:,.0f}</td></tr>
    <tr><td style="padding:8px;border-bottom:1px solid #eee;color:#666;">Fee</td><td style="padding:8px;border-bottom:1px solid #eee;">MK {fee:,.0f}</td></tr>
    <tr><td style="padding:8px;color:#666;">Total to pay</td><td style="padding:8px;font-weight:700;">MK {total:,.0f}</td></tr>
  </table>
  <p style="color:#666;font-size:14px;">We will confirm and process your order shortly. You can track the status on your dashboard.</p>
  <hr style="border:none;border-top:1px solid #eee;margin:24px 0;">
  <p style="color:#999;font-size:12px;">SwiftMint Exchange &bull; Premium Outbound Mobile Money Facilitation</p>
</div>""",
    })


def send_transaction_completed_email(user_email: str, user_name: str, recipient_name: str, country: str, amount: float, reference: str):
    if not resend.api_key:
        return

    resend.Emails.send({
        "from": FROM_EMAIL,
        "to": [user_email],
        "subject": f"Transfer Completed — {reference}",
        "html": f"""
<div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
  <h2 style="color:#1a1a2e;">Transfer Completed</h2>
  <p>Hi {user_name},</p>
  <p>Your transfer has been successfully completed.</p>
  <table style="width:100%;border-collapse:collapse;margin:16px 0;">
    <tr><td style="padding:8px;border-bottom:1px solid #eee;color:#666;">Reference</td><td style="padding:8px;border-bottom:1px solid #eee;font-weight:700;">{reference}</td></tr>
    <tr><td style="padding:8px;border-bottom:1px solid #eee;color:#666;">Recipient</td><td style="padding:8px;border-bottom:1px solid #eee;">{recipient_name}</td></tr>
    <tr><td style="padding:8px;border-bottom:1px solid #eee;color:#666;">Country</td><td style="padding:8px;border-bottom:1px solid #eee;">{country}</td></tr>
    <tr><td style="padding:8px;color:#666;">Amount sent</td><td style="padding:8px;font-weight:700;">MK {amount:,.0f}</td></tr>
  </table>
  <p style="color:#666;font-size:14px;">The payout has been sent to your recipient. Thank you for using SwiftMint Exchange.</p>
  <hr style="border:none;border-top:1px solid #eee;margin:24px 0;">
  <p style="color:#999;font-size:12px;">SwiftMint Exchange &bull; Premium Outbound Mobile Money Facilitation</p>
</div>""",
    })
