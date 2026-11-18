import random
from datetime import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS
from config import Config
from database import init_db
from routes.auth_routes import auth_bp
from model_loader import predict_ticket
from services.email_service import notify_staff_new_ticket

app = Flask(__name__)
app.config["SECRET_KEY"] = Config.SECRET_KEY
CORS(app, resources={r"/api/*": {"origins": "*"}})

try:
    init_db()
except Exception:
    pass

app.register_blueprint(auth_bp)

TICKETS_STORE = [
    {
        "id": 1,
        "ticket_number": "TKT-2026-94812",
        "requester_name": "Aditya Sharma",
        "requester_email": "aditya.sharma@corp.io",
        "department": "Infrastructure",
        "subject": "PostgreSQL connection timeout in production cluster",
        "description": "Facing 504 Gateway errors during peak writes. DB connection pool exhausted on primary replica.",
        "category": "Technical Support",
        "category_confidence": 94.2,
        "priority": "high",
        "priority_confidence": 91.8,
        "is_spam": False,
        "spam_probability": 0.4,
        "csat_rating": 2,
        "status": "Open",
        "created_at": "2026-11-08 09:20",
        "notes": ["Checked replica replication lag"]
    },
    {
        "id": 2,
        "ticket_number": "TKT-2026-83491",
        "requester_name": "Pooja Verma",
        "requester_email": "pooja.v@finance.in",
        "department": "Finance",
        "subject": "Invoice settlement mismatch for October enterprise plan",
        "description": "Enterprise tax deduction TDS certificate shows difference of 18% GST ledger entries.",
        "category": "Billing Inquiry",
        "category_confidence": 89.6,
        "priority": "medium",
        "priority_confidence": 85.4,
        "is_spam": False,
        "spam_probability": 0.8,
        "csat_rating": 3,
        "status": "In Progress",
        "created_at": "2026-11-08 10:45",
        "notes": []
    },
    {
        "id": 3,
        "ticket_number": "TKT-2026-72109",
        "requester_name": "Rohan Mehra",
        "requester_email": "rohan.m@operations.co",
        "department": "Operations",
        "subject": "VPN profile sync issue on MacOS Sequoia",
        "description": "Need updated WireGuard server configurations for newly onboarded team.",
        "category": "Technical Support",
        "category_confidence": 88.1,
        "priority": "low",
        "priority_confidence": 79.5,
        "is_spam": False,
        "spam_probability": 2.1,
        "csat_rating": 4,
        "status": "Resolved",
        "created_at": "2026-11-08 11:15",
        "notes": ["Profile generated and sent via secure email"]
    },
    {
        "id": 4,
        "ticket_number": "TKT-2026-61023",
        "requester_name": "Unknown Sender",
        "requester_email": "prize-claim@free-reward-fast.xyz",
        "department": "External",
        "subject": "CONGRATULATIONS: You won a $1000 Walmart Gift Card",
        "description": "Click here immediately http://secure-claim-rewards.top to claim your annual employee reward.",
        "category": "Product Inquiry",
        "category_confidence": 54.0,
        "priority": "low",
        "priority_confidence": 60.0,
        "is_spam": True,
        "spam_probability": 99.8,
        "csat_rating": 1,
        "status": "Quarantined",
        "created_at": "2026-11-08 12:00",
        "notes": ["Auto-quarantined by security gatekeeper"]
    }
]

@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "status": "online",
        "service": "Support Ticket API",
        "endpoints": {
            "auth_send_otp": "/api/auth/send-otp",
            "auth_verify_otp": "/api/auth/verify-otp",
            "classify_ticket": "/api/tickets/classify",
            "list_tickets": "/api/tickets",
            "create_ticket": "/api/tickets/create"
        }
    }), 200

@app.route("/api/tickets/classify", methods=["POST"])
def classify_ticket():
    data = request.get_json() or {}
    text = data.get("text", "").strip()
    age = int(data.get("age", 30))

    if not text:
        return jsonify({"error": "No text provided"}), 400

    result = predict_ticket(text, age=age)
    return jsonify(result), 200

@app.route("/api/tickets", methods=["GET"])
def get_tickets():
    return jsonify(TICKETS_STORE), 200

@app.route("/api/tickets/create", methods=["POST"])
def create_ticket():
    data = request.get_json() or {}
    subject = data.get("subject", "").strip()
    description = data.get("description", "").strip()
    combined_text = f"{subject} {description}".strip()
    
    age = int(data.get("age", 30))
    analysis = predict_ticket(combined_text, age=age)

    status = "Quarantined" if analysis["is_spam"] else "Open"

    ticket_number = f"TKT-2026-{random.randint(10000, 99999)}"
    new_ticket = {
        "id": len(TICKETS_STORE) + 1,
        "ticket_number": ticket_number,
        "requester_name": data.get("name", "Support User"),
        "requester_email": data.get("email", "user@company.com"),
        "department": data.get("department", "IT Support"),
        "subject": subject or "Support Request",
        "description": description or "No description provided.",
        "category": analysis["category"],
        "category_confidence": analysis["category_confidence"],
        "priority": analysis["priority"],
        "priority_confidence": analysis["priority_confidence"],
        "is_spam": analysis["is_spam"],
        "spam_probability": analysis["spam_probability"],
        "csat_rating": analysis["csat_rating"],
        "status": status,
        "created_at": datetime.now().strftime("%Y-%m-%d %H:%M"),
        "notes": []
    }

    TICKETS_STORE.insert(0, new_ticket)
    try:
        notify_staff_new_ticket(new_ticket)
    except Exception:
        pass

    return jsonify(new_ticket), 200

@app.route("/api/tickets/<int:ticket_id>", methods=["PATCH", "PUT"])
def update_ticket(ticket_id):
    data = request.get_json() or {}
    for ticket in TICKETS_STORE:
        if ticket["id"] == ticket_id:
            if "status" in data:
                ticket["status"] = data["status"]
            if "priority" in data:
                ticket["priority"] = data["priority"]
            if "note" in data and data["note"].strip():
                ticket["notes"].append(data["note"].strip())
            return jsonify(ticket), 200
    return jsonify({"error": "Ticket not found"}), 404

@app.route("/api/tickets/<int:ticket_id>", methods=["DELETE"])
def delete_ticket(ticket_id):
    global TICKETS_STORE
    initial_len = len(TICKETS_STORE)
    TICKETS_STORE = [t for t in TICKETS_STORE if t["id"] != ticket_id]
    if len(TICKETS_STORE) < initial_len:
        return jsonify({"message": f"Ticket {ticket_id} deleted successfully"}), 200
    return jsonify({"error": "Ticket not found"}), 404

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=Config.FLASK_PORT, debug=True)
