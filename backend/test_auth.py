import os
from supabase import create_client
from app.core.config import settings

supabase = create_client(
    settings.supabase_url,
    settings.supabase_anon_key,
)

email = os.environ.get("TEST_USER_EMAIL", "test@example.com")
password = os.environ.get("TEST_USER_PASSWORD", "")

if not password:
    print("Set TEST_USER_EMAIL and TEST_USER_PASSWORD to run test_auth.py")
    exit(0)

response = supabase.auth.sign_in_with_password(
    {
        "email": email,
        "password": password,
    }
)

if not response.session or not response.user:
    raise RuntimeError("Login failed")

print("USER UUID:")
print(response.user.id)

print("\nEMAIL:")
print(response.user.email)

print("\nACCESS TOKEN:")
print(response.session.access_token)