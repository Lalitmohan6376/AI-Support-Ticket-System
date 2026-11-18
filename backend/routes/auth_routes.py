from flask import Blueprint, request, jsonify
from services.otp_service import request_otp, verify_otp_code
from config import Config

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")

@auth_bp.route("/send-otp", methods=["POST"])
def send_otp():
    data = request.get_json() or {}
    email = data.get("email", "").strip().lower()

    if not email or "@" not in email:
        return jsonify({"detail": "A valid email address is required."}), 400

    if Config.AUTHORIZED_STAFF_EMAILS and "*" not in Config.AUTHORIZED_STAFF_EMAILS:
        if email not in Config.AUTHORIZED_STAFF_EMAILS:
            return jsonify({
                "detail": "Access Denied: This email is not registered as an authorized support staff member."
            }), 403

    try:
        result = request_otp(email)
        return jsonify({
            "message": "Verification code dispatched successfully.",
            "email": result["email"],
            "expires_in_minutes": result["expires_in_minutes"]
        }), 200
    except Exception as e:
        return jsonify({"detail": f"Failed to generate OTP: {str(e)}"}), 500

@auth_bp.route("/verify-otp", methods=["POST"])
def verify_otp():
    data = request.get_json() or {}
    email = data.get("email", "").strip()
    otp = data.get("otp", "").strip()

    if not email:
        return jsonify({"detail": "Email is required."}), 400
    if not otp:
        return jsonify({"detail": "Verification OTP code is required."}), 400

    try:
        result = verify_otp_code(email, otp)
        if result["verified"]:
            return jsonify({
                "message": result["message"],
                "token": result["token"],
                "email": result["email"]
            }), 200
        else:
            return jsonify({"detail": result["error"]}), 400
    except Exception as e:
        return jsonify({"detail": f"Verification error: {str(e)}"}), 500
