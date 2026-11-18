import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from config import Config

def send_otp_email(to_email, otp_code, expiry_minutes=5):
    sender_email = Config.SMTP_EMAIL
    sender_password = Config.SMTP_PASSWORD

    if not sender_email or not sender_password:
        return {"success": False, "message": "SMTP credentials not configured."}

    msg = MIMEMultipart("alternative")
    msg["Subject"] = f"Support Portal Verification Code: {otp_code}"
    msg["From"] = f"Support Operations <{sender_email}>"
    msg["To"] = to_email

    text_content = f"""Support Portal Authentication Code: {otp_code}

This one-time passcode will expire in {expiry_minutes} minutes.
Do not share this code with anyone.

Support Operations Team"""

    html_content = f"""<!DOCTYPE html>
<html>
<body style="font-family: sans-serif; background-color: #0b0f19; color: #e2e8f0; padding: 24px;">
    <div style="max-width: 480px; margin: 0 auto; background: #131b2e; border: 1px solid #1e293b; border-radius: 12px; padding: 32px;">
        <span style="display: inline-block; background: rgba(99, 102, 241, 0.15); color: #818cf8; font-size: 11px; font-weight: 600; padding: 4px 10px; border-radius: 9999px;">Staff Security</span>
        <h2 style="margin-top: 16px; color: #f8fafc; font-size: 20px;">Staff Verification Passcode</h2>
        <p style="color: #94a3b8; font-size: 14px;">Use the 6-digit one-time passcode below to verify your session:</p>
        <div style="background: #0b0f19; border: 1px solid #334155; border-radius: 8px; padding: 18px; text-align: center; margin: 24px 0;">
            <div style="font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #38bdf8; font-family: monospace;">{otp_code}</div>
        </div>
        <p style="color: #94a3b8; font-size: 13px;">Code expires in <strong>{expiry_minutes} minutes</strong>.</p>
    </div>
</body>
</html>"""

    msg.attach(MIMEText(text_content, "plain"))
    msg.attach(MIMEText(html_content, "html"))

    try:
        if Config.SMTP_PORT == 465:
            with smtplib.SMTP_SSL(Config.SMTP_SERVER, Config.SMTP_PORT, timeout=10) as server:
                server.login(sender_email, sender_password)
                server.sendmail(sender_email, to_email, msg.as_string())
        else:
            with smtplib.SMTP(Config.SMTP_SERVER, Config.SMTP_PORT, timeout=10) as server:
                server.ehlo()
                server.starttls()
                server.ehlo()
                server.login(sender_email, sender_password)
                server.sendmail(sender_email, to_email, msg.as_string())

        return {"success": True, "message": f"Verification email dispatched to {to_email}"}
    except Exception as e:
        return {"success": False, "error": str(e)}

def notify_staff_new_ticket(ticket_data):
    staff_recipients = Config.AUTHORIZED_STAFF_EMAILS
    sender_email = Config.SMTP_EMAIL
    sender_password = Config.SMTP_PASSWORD

    if not sender_email or not sender_password or not staff_recipients:
        return False

    subject = f"New Ticket Alert [{ticket_data.get('ticket_number')}]: {ticket_data.get('subject')}"
    body = f"""A new support ticket has been received:

Ticket ID: {ticket_data.get('ticket_number')}
Requester: {ticket_data.get('requester_name')} ({ticket_data.get('requester_email')})
Department: {ticket_data.get('department')}
Category: {ticket_data.get('category')}
Priority: {ticket_data.get('priority')}
Status: {ticket_data.get('status')}
Subject: {ticket_data.get('subject')}
Description: {ticket_data.get('description')}
"""

    for recipient in staff_recipients:
        try:
            msg = MIMEMultipart()
            msg["Subject"] = subject
            msg["From"] = f"Support Operations <{sender_email}>"
            msg["To"] = recipient
            msg.attach(MIMEText(body, "plain"))

            if Config.SMTP_PORT == 465:
                with smtplib.SMTP_SSL(Config.SMTP_SERVER, Config.SMTP_PORT, timeout=10) as server:
                    server.login(sender_email, sender_password)
                    server.sendmail(sender_email, recipient, msg.as_string())
            else:
                with smtplib.SMTP(Config.SMTP_SERVER, Config.SMTP_PORT, timeout=10) as server:
                    server.ehlo()
                    server.starttls()
                    server.ehlo()
                    server.login(sender_email, sender_password)
                    server.sendmail(sender_email, recipient, msg.as_string())
        except Exception:
            pass

    return True
