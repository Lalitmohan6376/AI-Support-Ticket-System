import os
from dotenv import load_dotenv

basedir = os.path.abspath(os.path.dirname(__file__))
load_dotenv(os.path.join(basedir, ".env"))

class Config:
    MYSQL_HOST = os.getenv("MYSQL_HOST", "localhost")
    MYSQL_PORT = int(os.getenv("MYSQL_PORT", 3306))
    MYSQL_USER = os.getenv("MYSQL_USER", "root")
    MYSQL_PASSWORD = os.getenv("MYSQL_PASSWORD", "")
    MYSQL_DATABASE = os.getenv("MYSQL_DATABASE", "ticket_support")

    SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")
    SMTP_PORT = int(os.getenv("SMTP_PORT", 587))
    SMTP_EMAIL = os.getenv("SMTP_EMAIL", "")
    SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")

    OTP_EXPIRY_MINUTES = int(os.getenv("OTP_EXPIRY_MINUTES", 5))
    SECRET_KEY = os.getenv("SECRET_KEY", "default-dev-secret-key")
    FLASK_PORT = int(os.getenv("FLASK_PORT", 8000))

    DEFAULT_STAFF_EMAILS = [
        "lalitg6376@gmail.com",
        "staff1@supportdesk.com",
        "staff2@supportdesk.com",
        "support@deskoperations.com",
        "admin@supportdesk.com",
        "security@supportdesk.com"
    ]

    AUTHORIZED_STAFF_EMAILS = [
        e.strip().lower() 
        for e in os.getenv(
            "AUTHORIZED_STAFF_EMAILS", 
            ",".join(DEFAULT_STAFF_EMAILS)
        ).split(",")
        if e.strip()
    ]
