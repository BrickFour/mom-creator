"""
Demo accounts configuration and helpers.
These demo accounts do not require Supabase authentication in the real project database.
"""
from uuid import uuid4
import logging

logger = logging.getLogger(__name__)

DEMO_ACCOUNTS = [
    {"name": "Hemant Sir", "email": "hemant@brickfour.com", "password": "Hemant@123", "id": "77e50b39-7ab5-4dc9-82bb-8aadffb47460"},
    {"name": "Dwarka Laxman Khandade", "email": "dwarka@brickfour.com", "password": "Dwarka@123", "id": "86e57b2b-afb6-486a-a0f7-2330bd6ce1f8"},
    {"name": "Sanghshil Ghatkamble", "email": "sanghshil@brickfour.com", "password": "Sanghshil@123", "id": "546319d1-17b2-4bf0-830a-9ce57575ea51"},
    {"name": "Shailesh Kerkar", "email": "shailesh@brickfour.com", "password": "Shailesh@123", "id": "abdf0eba-e194-48c7-b0bd-2bc2d7d98a01"},
    {"name": "Santosh Kotgire", "email": "s.kotgire@brickfour.com", "password": "Santosh@123", "id": "41653acb-f0af-4a6f-9222-ac5bb45e1a00"},
    {"name": "Amol Umesh Biradar", "email": "amolbiradar218@gmail.com", "password": "Amol@123", "id": "1e7f1f01-b4c6-4e39-aa79-27fa8433a3e9"},
    {"name": "Charuta Kulkarni", "email": "kulkarnicharuta1999@gmail.com", "password": "Charuta@123", "id": "2d53c76d-ee75-4402-a803-3297373f3253"},
    {"name": "Pramod Chavan", "email": "pramod.chavan@brickfour.com", "password": "Pramod@123", "id": "89c6ac70-e987-403b-99ed-b6afcb496ab0"},
    {"name": "Rahul Gundappa Gaikwad", "email": "rahulgaikwad11111@gmail.com", "password": "Rahul@123", "id": "0a2b365e-a550-48f4-bc6e-b4020b203857"},
    {"name": "Yash Balasaheb Sabale", "email": "techsupport@brickfour.com", "password": "Yash@123", "id": "2fcaa76d-7ecc-42ed-945a-05e09d4faf78"},
    {"name": "Vikas Khatik", "email": "vikas.khatik@brickfour.com", "password": "Vikas@123", "id": "9412cc5b-0706-44f3-9ed1-25e103389bc5"},
    {"name": "Jyotsana Nikum", "email": "hr@greenovation.co", "password": "Jyotsana@123", "id": "8fba3c23-44d5-4062-9018-7f75d5298a6f"},
    {"name": "Sonal Bhorkade", "email": "sonal.bhorkade2018@gmail.com", "password": "Sonal@123", "id": "058953c7-efc4-4b19-86e9-6d5cd5c98f49"},
    {"name": "Archana Katkar", "email": "archana.katkar@brickfour.com", "password": "Archana@123", "id": "670daf60-f08d-4a25-bccf-263e42824587"},
    {"name": "Balasaheb Mundhe", "email": "greenoliasoning@gmail.com", "password": "Balasaheb@123", "id": "2f336e3e-2213-4fa7-97b5-9a43a7a5dee1"},
    {"name": "Darshana Uttam Ghodake", "email": "darshanaghodake4@gmail.com", "password": "Darshana@123", "id": "c8016bc6-d8e8-47c6-87c6-205e9f0c2683"},
    {"name": "Atul Bhardwaj", "email": "gbhardhwj@gmail.com", "password": "Atul@123", "id": "a7cd05d6-1c8e-49b7-a80d-1f47e2e12822"},
    {"name": "Kapil Anil Aru", "email": "kapil.aru@brickfour.com", "password": "Kapil@123", "id": "c82afb0b-93ee-45e8-a658-bcc471dacfe2"},
    {"name": "Nishant Hemant Kale", "email": "marketintelligence@brickfour.com", "password": "Nishant@123", "id": "7adf9710-e857-4d37-9da1-2210ae2343a6"},
    {"name": "Omkar Sawant", "email": "omkarsawant36@gmail.com", "password": "Omkar@123", "id": "59790bd1-c684-4c3d-8ad1-47bd1100bdf0"},
    {"name": "Bhagyashree Patil", "email": "bp2664619@gmail.com", "password": "Bhagyashree@123", "id": "b827e61a-c37a-4fa7-aa4c-917e6f66bd08"},
    {"name": "Sachin Bagkar", "email": "sachinbagkar22@gmail.com", "password": "Sachin@123", "id": "f28fb182-8cfe-495a-8377-7b70a27e726e"},
    {"name": "Ganesh Shivaji Veer", "email": "purchase@brickfour.com", "password": "Ganesh@123", "id": "74e1051b-a324-45c1-b0ed-4215df142b73"},
    {"name": "Prajeet Patil", "email": "purchase.urbanedge@gmail.com", "password": "Prajeet@123", "id": "2fc37acc-eed9-4021-b30b-11bd96cb0d1a"},
    {"name": "Akshay Sonawane", "email": "akshaysonawane2877@gmail.com", "password": "Akshay@123", "id": "22ae0383-5b03-4201-93b9-495cae277991"},
    {"name": "Suvidha Deshmukh", "email": "suvidha.deshmukh@brickfour.com", "password": "Suvidha@123", "id": "76a3bedb-31ea-4fa0-81eb-10fd998bea9c"},
    {"name": "Tayamma Bhandari", "email": "chaya.bhandari@brickfour.com", "password": "Tayamma@123", "id": "14d86736-4c53-4b3b-9287-5a2cfe387693"},
]

DEMO_ACCOUNTS_BY_EMAIL = {
    account["email"].strip().lower(): account
    for account in DEMO_ACCOUNTS
}

DEMO_ACCOUNTS_BY_ID = {
    account["id"]: account
    for account in DEMO_ACCOUNTS
}


class DemoUser:
    """Mock user object matching Supabase User shape."""
    def __init__(self, id: str, email: str, name: str):
        self.id = id
        self.email = email
        self.user_metadata = {
            "name": name,
            "full_name": name,
        }
        self.app_metadata = {
            "provider": "demo",
        }
        self.role = "authenticated"


def is_demo_token(token: str) -> bool:
    if not token or not isinstance(token, str):
        return False
    return token.startswith("demo-token:")


def get_demo_user_from_token(token: str) -> DemoUser | None:
    if not is_demo_token(token):
        return None
    email = token.split("demo-token:", 1)[1].strip().lower()
    acc = DEMO_ACCOUNTS_BY_EMAIL.get(email)
    if not acc:
        return None
    return DemoUser(id=acc["id"], email=acc["email"], name=acc["name"])


def ensure_demo_user_db_state(admin_client, demo_user: DemoUser):
    """
    Ensure the demo user has a profile and at least one workspace in the database
    so they can create meetings and view data immediately in the real project.
    """
    try:
        # 1. Ensure profile exists
        prof_res = (
            admin_client
            .table("profiles")
            .select("id")
            .eq("id", demo_user.id)
            .execute()
        )
        if not prof_res.data:
            admin_client.table("profiles").insert({
                "id": demo_user.id,
                "name": demo_user.user_metadata.get("name") or demo_user.email,
            }).execute()

        # 2. Ensure user has a workspace
        mem_res = (
            admin_client
            .table("workspace_members")
            .select("workspace_id")
            .eq("user_id", demo_user.id)
            .execute()
        )
        if not mem_res.data:
            ws_id = str(uuid4())
            admin_client.table("workspaces").insert({
                "id": ws_id,
                "name": f"{demo_user.user_metadata.get('name', 'Demo')}'s Workspace",
                "created_by": demo_user.id,
                "terminology": {},
            }).execute()
    except Exception as exc:
        logger.warning("Could not auto-provision demo user db state: %s", exc)
