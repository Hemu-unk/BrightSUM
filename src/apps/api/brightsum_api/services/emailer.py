import os
import smtplib
import ssl
from email.message import EmailMessage

from typing import Optional

EMAIL_VERIFICATION_ENABLED = os.getenv("EMAIL_VERIFICATION_ENABLED", "False").lower() in ("1", "true", "yes")
EMAIL_VERIFICATION_DEBUG = os.getenv("EMAIL_VERIFICATION_DEBUG", "False").lower() in ("1", "true", "yes")
EMAIL_HOST = os.getenv("EMAIL_HOST")
EMAIL_PORT = int(os.getenv("EMAIL_PORT", "465"))
EMAIL_USER = os.getenv("EMAIL_USER")
EMAIL_PASS = os.getenv("EMAIL_PASS")
EMAIL_FROM = os.getenv("EMAIL_FROM")


def send_email(subject: str, body: str, to: str) -> bool:
    """Send an email using SMTP. Returns True on success, False otherwise."""
    if not EMAIL_VERIFICATION_ENABLED:
        # In dev mode or when disabled, don't attempt to actually send
        print(f"[emailer] Skipping send: {subject} -> {to}\n{body}")
        return True

    if not (EMAIL_HOST and EMAIL_USER and EMAIL_PASS and EMAIL_FROM):
        print("[emailer] Missing email configuration; cannot send")
        return False

    msg = EmailMessage()
    msg["Subject"] = subject
    msg["From"] = EMAIL_FROM
    msg["To"] = to
    msg.set_content(body)

    try:
        context = ssl.create_default_context()
        # Use SMTP over SSL (commonly port 465)
        with smtplib.SMTP_SSL(EMAIL_HOST, EMAIL_PORT, context=context) as smtp:
            smtp.login(EMAIL_USER, EMAIL_PASS)
            smtp.send_message(msg)
        print(f"[emailer] Sent verification email to {to}")
        return True
    except Exception as e:
        print("[emailer] Error sending email:", e)
        return False


def send_verification_email(to: str, code: str, verification_url: Optional[str] = None) -> bool:
    subject = "BrightSUM Email Verification"
    body = f"Your BrightSUM verification code is: {code}\n\n"
    if verification_url:
        body += f"You can also verify here: {verification_url}\n"
    body += "This code expires shortly. If you didn't request this email, you can ignore it."
    # In debug mode always print the code to aid development
    if EMAIL_VERIFICATION_DEBUG:
        print(f"[emailer][debug] Verification code for {to}: {code}")
    # Always log the send attempt
    print(f"[emailer] Attempting to send verification email to {to}")
    ok = send_email(subject, body, to)
    if not ok:
        print(f"[emailer] Failed to send to {to}")
    return ok


def send_password_reset_email(to: str, code: str, reset_url: Optional[str] = None) -> bool:
    subject = "BrightSUM Password Reset"
    body = f"Your BrightSUM password reset code is: {code}\n\n"
    if reset_url:
        body += f"You can also reset your password here: {reset_url}\n"
    body += "This code expires shortly. If you didn't request this email, you can ignore it."
    if EMAIL_VERIFICATION_DEBUG:
        print(f"[emailer][debug] Password reset code for {to}: {code}")
    print(f"[emailer] Attempting to send password reset email to {to}")
    ok = send_email(subject, body, to)
    if not ok:
        print(f"[emailer] Failed to send password reset to {to}")
    return ok
