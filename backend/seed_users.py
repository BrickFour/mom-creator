import os
import sys
from pathlib import Path
import dotenv
from supabase import create_client

# Ensure backend root is on sys.path
backend_dir = Path(__file__).resolve().parent
sys.path.insert(0, str(backend_dir))

env_path = backend_dir / ".env"
if env_path.exists():
    dotenv.load_dotenv(dotenv_path=env_path)

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_ANON_KEY = os.environ.get("SUPABASE_ANON_KEY")
SUPABASE_SERVICE_ROLE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
    print("Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be configured in .env")
    sys.exit(1)

# List of users to seed
USERS_DATA = [
    {"name": "Hemant Sir", "email": "hemant@brickfour.com", "password": "Hemant@123"},
    {"name": "Dwarka Laxman Khandade", "email": "dwarka@brickfour.com", "password": "Dwarka@123"},
    {"name": "Sanghshil Ghatkamble", "email": "sanghshil@brickfour.com", "password": "Sanghshil@123"},
    {"name": "Shailesh Kerkar", "email": "shailesh@brickfour.com", "password": "Shailesh@123"},
    {"name": "Santosh Kotgire", "email": "s.kotgire@brickfour.com", "password": "Santosh@123"},
    {"name": "Amol Umesh Biradar", "email": "amolbiradar218@gmail.com", "password": "Amol@123"},
    {"name": "Charuta Kulkarni", "email": "kulkarnicharuta1999@gmail.com", "password": "Charuta@123"},
    {"name": "Pramod Chavan", "email": "pramod.chavan@brickfour.com", "password": "Pramod@123"},
    {"name": "Rahul Gundappa Gaikwad", "email": "rahulgaikwad11111@gmail.com", "password": "Rahul@123"},
    {"name": "Yash Balasaheb Sabale", "email": "techsupport@brickfour.com", "password": "Yash@123"},
    {"name": "Vikas Khatik", "email": "vikas.khatik@brickfour.com", "password": "Vikas@123"},
    {"name": "Jyotsana Nikum", "email": "hr@greenovation.co", "password": "Jyotsana@123"},
    {"name": "Sonal Bhorkade", "email": "sonal.bhorkade2018@gmail.com", "password": "Sonal@123"},
    {"name": "Archana Katkar", "email": "archana.katkar@brickfour.com", "password": "Archana@123"},
    {"name": "Balasaheb Mundhe", "email": "greenoliasoning@gmail.com", "password": "Balasaheb@123"},
    {"name": "Darshana Uttam Ghodake", "email": "darshanaghodake4@gmail.com", "password": "Darshana@123"},
    {"name": "Atul Bhardwaj", "email": "gbhardhwj@gmail.com", "password": "Atul@123"},
    {"name": "Kapil Anil Aru", "email": "kapil.aru@brickfour.com", "password": "Kapil@123"},
    {"name": "Nishant Hemant Kale", "email": "marketintelligence@brickfour.com", "password": "Nishant@123"},
    {"name": "Omkar Sawant", "email": "omkarsawant36@gmail.com", "password": "Omkar@123"},
    {"name": "Bhagyashree Patil", "email": "bp2664619@gmail.com", "password": "Bhagyashree@123"},
    {"name": "Sachin Bagkar", "email": "sachinbagkar22@gmail.com", "password": "Sachin@123"},
    {"name": "Ganesh Shivaji Veer", "email": "purchase@brickfour.com", "password": "Ganesh@123"},
    {"name": "Prajeet Patil", "email": "purchase.urbanedge@gmail.com", "password": "Prajeet@123"},
    {"name": "Akshay Sonawane", "email": "akshaysonawane2877@gmail.com", "password": "Akshay@123"},
    {"name": "Suvidha Deshmukh", "email": "suvidha.deshmukh@brickfour.com", "password": "Suvidha@123"},
    {"name": "Tayamma Bhandari", "email": "chaya.bhandari@brickfour.com", "password": "Tayamma@123"},
]


def seed_users():
    admin_client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    anon_client = create_client(SUPABASE_URL, SUPABASE_ANON_KEY) if SUPABASE_ANON_KEY else None

    print(f"Connecting to Supabase at: {SUPABASE_URL}")
    print(f"Total users to process: {len(USERS_DATA)}")
    print("-" * 70)

    # Fetch existing users
    existing_users = admin_client.auth.admin.list_users()
    email_to_user = {u.email.lower(): u for u in existing_users if u.email}

    results = []

    for idx, item in enumerate(USERS_DATA, 1):
        name = item["name"]
        email = item["email"].strip().lower()
        password = item["password"]

        user_id = None
        status = ""

        try:
            if email in email_to_user:
                existing = email_to_user[email]
                user_id = existing.id
                # Update password, confirm email, and metadata
                admin_client.auth.admin.update_user_by_id(
                    user_id,
                    {
                        "password": password,
                        "email_confirm": True,
                        "user_metadata": {
                            "name": name,
                            "full_name": name,
                        },
                    },
                )
                status = "Updated existing user"
            else:
                created = admin_client.auth.admin.create_user(
                    {
                        "email": email,
                        "password": password,
                        "email_confirm": True,
                        "user_metadata": {
                            "name": name,
                            "full_name": name,
                        },
                    }
                )
                user_id = created.user.id
                status = "Created new user"

            # Ensure profile exists and name is up to date
            prof_check = (
                admin_client.table("profiles")
                .select("id, name")
                .eq("id", user_id)
                .execute()
            )
            if not prof_check.data:
                admin_client.table("profiles").insert(
                    {"id": user_id, "name": name}
                ).execute()
            else:
                admin_client.table("profiles").update(
                    {"name": name}
                ).eq("id", user_id).execute()

            # Test direct login with anon client
            login_verified = False
            login_err = ""
            if anon_client:
                try:
                    auth_res = anon_client.auth.sign_in_with_password(
                        {"email": email, "password": password}
                    )
                    if auth_res.session and auth_res.session.access_token:
                        login_verified = True
                except Exception as e:
                    login_err = str(e)

            results.append({
                "num": idx,
                "name": name,
                "email": email,
                "password": password,
                "status": status,
                "user_id": user_id,
                "login_verified": login_verified,
                "login_err": login_err,
            })
            print(f"[{idx:02d}/{len(USERS_DATA):02d}] {status}: {name} <{email}> -> Login verified: {login_verified}")

        except Exception as exc:
            print(f"[{idx:02d}/{len(USERS_DATA):02d}] ERROR for {name} <{email}>: {exc}")
            results.append({
                "num": idx,
                "name": name,
                "email": email,
                "password": password,
                "status": f"FAILED: {exc}",
                "user_id": None,
                "login_verified": False,
                "login_err": str(exc),
            })

    print("-" * 70)
    print("Summary:")
    success_count = sum(1 for r in results if r["login_verified"])
    print(f"Successfully created/verified logins: {success_count}/{len(USERS_DATA)}")
    return results


if __name__ == "__main__":
    seed_users()
