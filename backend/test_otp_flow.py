import unittest
from datetime import datetime, timedelta
import pymysql
from config import Config
from database import init_db, get_db_connection
from services.otp_service import generate_otp_code, request_otp, verify_otp_code
from app import app

class TestOTPAuthenticationFlow(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        init_db()
        cls.client = app.test_client()
        cls.test_email = "lalitg6376@gmail.com"

    def tearDown(self):
        conn = get_db_connection()
        with conn.cursor() as cur:
            cur.execute("DELETE FROM otp_verifications WHERE email = %s;", (self.test_email,))
        conn.close()

    def test_01_otp_generation_with_secrets(self):
        otp = generate_otp_code(6)
        self.assertEqual(len(otp), 6)
        self.assertTrue(otp.isdigit())

    def test_02_request_otp_saves_to_mysql_with_datetime_expiry(self):
        result = request_otp(self.test_email)
        self.assertTrue(result["success"])
        self.assertEqual(result["email"], self.test_email)

        conn = get_db_connection()
        with conn.cursor() as cur:
            cur.execute("SELECT * FROM otp_verifications WHERE email = %s ORDER BY id DESC LIMIT 1;", (self.test_email,))
            record = cur.fetchone()
        conn.close()

        self.assertIsNotNone(record)
        self.assertEqual(len(record["otp_code"]), 6)
        self.assertFalse(record["is_verified"])
        self.assertGreater(record["expires_at"], record["created_at"])

    def test_03_verify_with_incorrect_otp(self):
        request_otp(self.test_email)
        result = verify_otp_code(self.test_email, "000000")
        self.assertFalse(result["verified"])
        self.assertIn("Invalid verification code", result["error"])

    def test_04_verify_with_expired_otp(self):
        request_otp(self.test_email)

        past_time = datetime.now() - timedelta(minutes=10)
        conn = get_db_connection()
        with conn.cursor() as cur:
            cur.execute("UPDATE otp_verifications SET expires_at = %s WHERE email = %s;", (past_time, self.test_email))
        conn.close()

        conn = get_db_connection()
        with conn.cursor() as cur:
            cur.execute("SELECT otp_code FROM otp_verifications WHERE email = %s LIMIT 1;", (self.test_email,))
            otp = cur.fetchone()["otp_code"]
        conn.close()

        result = verify_otp_code(self.test_email, otp)
        self.assertFalse(result["verified"])
        self.assertIn("expired", result["error"].lower())

    def test_05_verify_with_correct_otp_success(self):
        request_otp(self.test_email)

        conn = get_db_connection()
        with conn.cursor() as cur:
            cur.execute("SELECT otp_code FROM otp_verifications WHERE email = %s ORDER BY id DESC LIMIT 1;", (self.test_email,))
            otp = cur.fetchone()["otp_code"]
        conn.close()

        result = verify_otp_code(self.test_email, otp)
        self.assertTrue(result["verified"])
        self.assertIn("token", result)
        self.assertEqual(len(result["token"]), 48)

        conn = get_db_connection()
        with conn.cursor() as cur:
            cur.execute("SELECT is_verified FROM otp_verifications WHERE email = %s ORDER BY id DESC LIMIT 1;", (self.test_email,))
            is_verified = cur.fetchone()["is_verified"]
        conn.close()
        self.assertTrue(is_verified)

    def test_06_cannot_reuse_verified_otp(self):
        request_otp(self.test_email)

        conn = get_db_connection()
        with conn.cursor() as cur:
            cur.execute("SELECT otp_code FROM otp_verifications WHERE email = %s ORDER BY id DESC LIMIT 1;", (self.test_email,))
            otp = cur.fetchone()["otp_code"]
        conn.close()

        first_attempt = verify_otp_code(self.test_email, otp)
        self.assertTrue(first_attempt["verified"])

        second_attempt = verify_otp_code(self.test_email, otp)
        self.assertFalse(second_attempt["verified"])

    def test_07_flask_api_endpoints(self):
        res_send = self.client.post("/api/auth/send-otp", json={"email": self.test_email})
        self.assertEqual(res_send.status_code, 200)
        data_send = res_send.get_json()
        self.assertIn("Verification code dispatched", data_send["message"])

        conn = get_db_connection()
        with conn.cursor() as cur:
            cur.execute("SELECT otp_code FROM otp_verifications WHERE email = %s ORDER BY id DESC LIMIT 1;", (self.test_email,))
            otp = cur.fetchone()["otp_code"]
        conn.close()

        res_verify = self.client.post("/api/auth/verify-otp", json={
            "email": self.test_email,
            "otp": otp
        })
        self.assertEqual(res_verify.status_code, 200)
        data_verify = res_verify.get_json()
        self.assertIn("token", data_verify)

    def test_08_unauthorized_email_is_blocked(self):
        res = self.client.post("/api/auth/send-otp", json={"email": "hacker@random.com"})
        self.assertEqual(res.status_code, 403)
        data = res.get_json()
        self.assertIn("Access Denied", data["detail"])

if __name__ == "__main__":
    unittest.main()
