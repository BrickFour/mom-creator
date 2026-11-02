import unittest
from unittest.mock import MagicMock, patch
from uuid import uuid4
from fastapi.testclient import TestClient

from app.main import app
from app.core.security import get_access_token, get_supabase


class TestMOMShare(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)
        self.mom_id = str(uuid4())
        self.meeting_id = str(uuid4())
        self.source_workspace_id = str(uuid4())
        self.target_workspace_id = str(uuid4())
        self.owner_user_id = str(uuid4())
        self.non_owner_id = str(uuid4())

    def test_share_mom_invalid_uuid(self):
        """Should fail if target_workspace_id is not a valid UUID."""
        app.dependency_overrides[get_access_token] = lambda: "fake-token"
        mock_user = MagicMock(id=self.owner_user_id)
        mock_supabase = MagicMock()
        mock_supabase.auth.get_user.return_value = MagicMock(user=mock_user)
        app.dependency_overrides[get_supabase] = lambda: mock_supabase

        try:
            response = self.client.post(
                f"/api/v1/moms/{self.mom_id}/share",
                headers={"Authorization": "Bearer fake-token"},
                json={"target_workspace_id": "not-a-valid-uuid"},
            )
            self.assertEqual(response.status_code, 400)
            self.assertIn("Invalid target workspace ID format", response.json()["detail"])
        finally:
            app.dependency_overrides.clear()

    def test_share_mom_same_workspace(self):
        """Should fail if target workspace is same as source workspace."""
        app.dependency_overrides[get_access_token] = lambda: "fake-token"
        mock_user = MagicMock(id=self.owner_user_id)
        mock_supabase = MagicMock()
        mock_supabase.auth.get_user.return_value = MagicMock(user=mock_user)
        app.dependency_overrides[get_supabase] = lambda: mock_supabase

        # Mock admin supabase queries
        mock_admin = MagicMock()
        # source_mom
        mock_admin.table().select().eq().execute.side_effect = [
            # source mom
            MagicMock(data=[{"id": self.mom_id, "meeting_id": self.meeting_id, "title": "Test MOM"}]),
            # source meeting
            MagicMock(data=[{"id": self.meeting_id, "workspace_id": self.source_workspace_id, "title": "Meeting 1"}]),
        ]

        with patch("app.api.routes.moms.create_admin_supabase_client", return_value=mock_admin):
            try:
                response = self.client.post(
                    f"/api/v1/moms/{self.mom_id}/share",
                    headers={"Authorization": "Bearer fake-token"},
                    json={"target_workspace_id": self.source_workspace_id},
                )
                self.assertEqual(response.status_code, 400)
                self.assertIn("Cannot assign MOM to the same workspace", response.json()["detail"])
            finally:
                app.dependency_overrides.clear()

    def test_share_mom_forbidden_for_non_owner(self):
        """Should fail with 403 if user is not workspace owner."""
        app.dependency_overrides[get_access_token] = lambda: "fake-token"
        mock_user = MagicMock(id=self.non_owner_id)
        mock_supabase = MagicMock()
        mock_supabase.auth.get_user.return_value = MagicMock(user=mock_user)
        app.dependency_overrides[get_supabase] = lambda: mock_supabase

        mock_admin = MagicMock()
        # 1. source mom
        # 2. source meeting
        # 3. source workspace (created_by is owner_user_id)
        # 4. workspace_members check (role is member)
        mock_admin.table().select().eq().execute.side_effect = [
            MagicMock(data=[{"id": self.mom_id, "meeting_id": self.meeting_id, "title": "Test MOM"}]),
            MagicMock(data=[{"id": self.meeting_id, "workspace_id": self.source_workspace_id, "title": "Meeting 1"}]),
            MagicMock(data=[{"id": self.source_workspace_id, "name": "Source WS", "created_by": self.owner_user_id}]),
        ]
        # membership query has two .eq(): workspace_id and user_id
        mock_membership = MagicMock()
        mock_membership.execute.return_value = MagicMock(data=[{"role": "member"}])
        mock_admin.table().select().eq().eq.return_value = mock_membership

        with patch("app.api.routes.moms.create_admin_supabase_client", return_value=mock_admin):
            try:
                response = self.client.post(
                    f"/api/v1/moms/{self.mom_id}/share",
                    headers={"Authorization": "Bearer fake-token"},
                    json={"target_workspace_id": self.target_workspace_id},
                )
                self.assertEqual(response.status_code, 403)
                self.assertIn("Only the workspace owner can assign or share", response.json()["detail"])
            finally:
                app.dependency_overrides.clear()

    def test_share_mom_success(self):
        """Should clone meeting, mom, action items, participants into target workspace."""
        app.dependency_overrides[get_access_token] = lambda: "fake-token"
        mock_user = MagicMock(id=self.owner_user_id)
        mock_supabase = MagicMock()
        mock_supabase.auth.get_user.return_value = MagicMock(user=mock_user)
        app.dependency_overrides[get_supabase] = lambda: mock_supabase

        mock_admin = MagicMock()
        # Sequence of queries:
        # 1. source mom
        # 2. source meeting
        # 3. source workspace (created_by is owner_user_id -> owner match!)
        # 4. target workspace exists
        # 5. action items of source mom
        # 6. target workspace members
        # 7. meeting participants of source meeting
        mock_admin.table().select().eq().execute.side_effect = [
            MagicMock(data=[{
                "id": self.mom_id,
                "meeting_id": self.meeting_id,
                "title": "Strategy Discussion",
                "summary": "Discussed roadmap.",
                "transcript": "Hello world.",
                "key_discussion_points": ["Point 1"],
                "decisions": ["Decision 1"],
                "next_steps": ["Step 1"],
                "abbreviations_used": {"AI": "Artificial Intelligence"},
                "status": "reviewed",
            }]),
            MagicMock(data=[{
                "id": self.meeting_id,
                "workspace_id": self.source_workspace_id,
                "title": "Q4 Strategy Meeting",
                "description": "Planning Q4 OKRs",
                "mode": "upload",
                "meeting_date": "2026-11-01T10:00:00Z",
                "venue": "Room 101",
                "duration_seconds": 3600,
            }]),
            MagicMock(data=[{
                "id": self.source_workspace_id,
                "name": "Acme HQ",
                "created_by": self.owner_user_id,
            }]),
            MagicMock(data=[{
                "id": self.target_workspace_id,
                "name": "Engineering Team",
                "created_by": str(uuid4()),
            }]),
            # action items query
            MagicMock(data=[{
                "id": str(uuid4()),
                "task": "Deploy feature",
                "assigned_to": None,
                "assigned_name": "Alice",
                "due_date": "2026-11-05T00:00:00Z",
                "priority": "high",
            }]),
            # target members
            MagicMock(data=[]),
            # participants query
            MagicMock(data=[{
                "id": str(uuid4()),
                "name": "Bob",
                "email": "bob@example.com",
                "role": "Lead",
            }]),
        ]

        with patch("app.api.routes.moms.create_admin_supabase_client", return_value=mock_admin):
            try:
                response = self.client.post(
                    f"/api/v1/moms/{self.mom_id}/share",
                    headers={"Authorization": "Bearer fake-token"},
                    json={"target_workspace_id": self.target_workspace_id},
                )
                self.assertEqual(response.status_code, 200)
                data = response.json()
                self.assertTrue(data["success"])
                self.assertEqual(data["target_workspace_name"], "Engineering Team")
                self.assertEqual(data["target_workspace_id"], self.target_workspace_id)
                self.assertTrue(bool(data["new_meeting_id"]))
                self.assertTrue(bool(data["new_mom_id"]))
                # Check that insert was called for meetings, moms, action_items, meeting_participants
                insert_calls = mock_admin.table().insert.call_args_list
                self.assertEqual(len(insert_calls), 4)
            finally:
                app.dependency_overrides.clear()


if __name__ == "__main__":
    unittest.main()
