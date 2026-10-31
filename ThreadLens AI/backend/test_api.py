import sys
import os
import uuid

# Add backend directory to sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi.testclient import TestClient
from app.main import app
from app.database import SessionLocal
from app.models import User

def run_tests():
    with TestClient(app) as client:
        # 1. Health check
        res = client.get("/api/health")
        print("Health Check:", res.status_code, res.json())
        assert res.status_code == 200

        # 2. Protected application sections require an authenticated session
        protected_sections = [
            "/api/dashboard/metrics",
            "/api/logs",
            "/api/alerts",
            "/api/incidents",
            "/api/phishing/reports",
            "/api/devices",
            "/api/policies",
            "/api/users",
        ]
        for endpoint in protected_sections:
            response = client.get(endpoint)
            assert response.status_code == 401, f"{endpoint} was accessible without login"
        print("Protected Sections:", len(protected_sections), "endpoints reject unauthenticated access")

        # 3. Login as Admin
        res = client.post("/api/auth/login", json={"username": "admin", "password": "Admin@123"})
        print("Admin Login:", res.status_code, res.json().get("user", {}).get("role"))
        assert res.status_code == 200
        token = res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # 4. Auth Me
        res = client.get("/api/auth/me", headers=headers)
        print("Auth Me:", res.status_code, res.json().get("full_name"))
        assert res.status_code == 200

        # 5. Dashboard Metrics
        res = client.get("/api/dashboard/metrics", headers=headers)
        print("Dashboard Metrics:", res.status_code, "Total Logins:", res.json()["metrics"]["total_logins"], "Health Score:", res.json()["metrics"]["health_score"])
        assert res.status_code == 200

        # 6. Login Anomaly Simulation
        res = client.post("/api/logs/analyze", json={
            "username": "test_user",
            "ip_address": "185.220.101.5",
            "location": "Moscow, Russia",
            "device": "Linux Curl/Bot",
            "status": "Failed",
            "failed_attempts": 6
        }, headers=headers)
        print("Anomaly Analysis:", res.status_code, "Risk:", res.json()["risk_score"], "Severity:", res.json()["severity"], "Reasons:", len(res.json()["anomaly_reasons"]))
        assert res.status_code == 200
        assert res.json()["severity"] == "Critical"

        # 7. Phishing Email Analysis
        res = client.post("/api/phishing/analyze", json={
            "subject": "URGENT: Password expired",
            "sender_address": "support@it-portal.xyz",
            "email_content": "Your password has expired. Click here immediately to verify your credentials: http://192.168.1.50/login",
            "suspicious_url": "http://192.168.1.50/login"
        }, headers=headers)
        print("Phishing Analysis:", res.status_code, "Prediction:", res.json()["prediction"], "Confidence:", res.json()["confidence_score"])
        assert res.status_code == 200

        # 8. AI Alert Explanation (Fallback / Live)
        res = client.post("/api/ai/explain-alert", json={
            "title": "Brute-force Anomaly",
            "description": "7 failed logins in 2 minutes",
            "severity": "Critical",
            "source": "Login Anomaly Engine"
        }, headers=headers)
        print("AI Explain Alert:", res.status_code, "What happened:", res.json()["what_happened"][:50] + "...")
        assert res.status_code == 200

        # 9. Policies and Devices
        res = client.get("/api/policies", headers=headers)
        print("Policies Count:", len(res.json()))
        assert len(res.json()) >= 4

        res = client.get("/api/devices", headers=headers)
        print("Devices Count:", len(res.json()))
        assert len(res.json()) >= 4

        # 10. User profile registration and persistence
        suffix = uuid.uuid4().hex[:10]
        registration = {
            "full_name": "Profile Test User",
            "email": f"profile-{suffix}@example.org",
            "username": f"profile_{suffix}",
            "phone": "+1 555 0100",
            "job_title": "Security Analyst",
            "organization": "Example University",
            "password": "SecurePass123!",
        }
        try:
            res = client.post("/api/auth/register", json=registration)
            assert res.status_code == 201, res.text
            profile = res.json()["user"]
            assert profile["phone"] == registration["phone"]
            assert profile["job_title"] == registration["job_title"]
            assert profile["organization"] == registration["organization"]
            print("User Profile Registration:", res.status_code, "Profile fields persisted")
        finally:
            db = SessionLocal()
            try:
                db.query(User).filter(User.username == registration["username"]).delete()
                db.commit()
            finally:
                db.close()

        print("\n[ALL 10 BACKEND API AND ML TEST SUITES PASSED SUCCESSFULLY!]")

if __name__ == "__main__":
    run_tests()
