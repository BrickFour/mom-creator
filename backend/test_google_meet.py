import unittest
from unittest.mock import MagicMock, patch
from uuid import uuid4
from fastapi.testclient import TestClient

from app.main import app
from app.core.security import get_access_token, get_supabase


class TestGoogleMeet(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)

    def test_google_meet_forbidden_for_other_users(self):
        """Google Meet should be disabled for everyone other than thorataryan0@gmail.com."""
        app.dependency_overrides[get_access_token] = lambda: "token-other"
        mock_user = MagicMock(id=str(uuid4()), email="other.user@example.com")
        mock_supabase = MagicMock()
        mock_supabase.auth.get_user.return_value = MagicMock(user=mock_user)
        app.dependency_overrides[get_supabase] = lambda: mock_supabase

        try:
            # 1. Connect endpoint
            res = self.client.get(
                "/api/v1/integrations/google/meet/connect",
                headers={"Authorization": "Bearer token-other"},
            )
            self.assertEqual(res.status_code, 403)
            self.assertIn("This feature will be available once the domain is specified.", res.json()["detail"])

            # 2. Create meeting space endpoint
            res = self.client.post(
                f"/api/v1/integrations/google/meetings/{uuid4()}/meet",
                headers={"Authorization": "Bearer token-other"},
            )
            self.assertEqual(res.status_code, 403)
            self.assertIn("This feature will be available once the domain is specified.", res.json()["detail"])

            # 3. Create meeting with mode=google_meet
            res = self.client.post(
                "/api/v1/meetings",
                headers={"Authorization": "Bearer token-other"},
                json={
                    "workspace_id": str(uuid4()),
                    "title": "Online Sync",
                    "mode": "google_meet",
                },
            )
            self.assertEqual(res.status_code, 403)
            self.assertIn("This feature will be available once the domain is specified.", res.json()["detail"])
        finally:
            app.dependency_overrides.clear()

    def test_google_meet_allowed_for_thorataryan0(self):
        """Google Meet connect should proceed for thorataryan0@gmail.com."""
        app.dependency_overrides[get_access_token] = lambda: "token-aryan"
        mock_user = MagicMock(id=str(uuid4()), email="thorataryan0@gmail.com")
        mock_supabase = MagicMock()
        mock_supabase.auth.get_user.return_value = MagicMock(user=mock_user)
        app.dependency_overrides[get_supabase] = lambda: mock_supabase

        try:
            with patch("app.api.routes.google_meet.build_google_authorization_url", return_value="https://accounts.google.com/o/oauth2/auth"):
                res = self.client.get(
                    "/api/v1/integrations/google/meet/connect",
                    headers={"Authorization": "Bearer token-aryan"},
                )
                self.assertEqual(res.status_code, 200)
                self.assertIn("authorization_url", res.json())
        finally:
            app.dependency_overrides.clear()


if __name__ == "__main__":
    unittest.main()
