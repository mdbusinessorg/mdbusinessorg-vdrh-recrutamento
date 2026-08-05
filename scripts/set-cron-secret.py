import os, pathlib, urllib.request, json

env_path = pathlib.Path(__file__).parent.parent / ".env.local"
cron_secret = None
for line in env_path.read_text(encoding="utf-8").splitlines():
    if line.startswith("CRON_SECRET="):
        cron_secret = line.split("=", 1)[1].strip()
        break

if not cron_secret:
    print("CRON_SECRET not found in .env.local")
    exit(1)

token = os.environ.get("SUPABASE_ACCESS_TOKEN")
ref = "noywnuafpxvxvmfkjtbh"
url = f"https://api.supabase.com/v1/projects/{ref}/database/query"
escaped = cron_secret.replace("'", "''")
query = f"""
DELETE FROM public.cron_config WHERE key = 'cron_secret';
INSERT INTO public.cron_config (key, value) VALUES ('cron_secret', '{escaped}');
"""

req = urllib.request.Request(url, data=json.dumps({"query": query}).encode("utf-8"), headers={
    "Authorization": f"Bearer {token}",
    "Content-Type": "application/json",
    "User-Agent": "MosaloCron/1.0",
}, method="POST")

try:
    with urllib.request.urlopen(req, timeout=120) as resp:
        print(resp.read().decode("utf-8"))
except urllib.error.HTTPError as e:
    print(f"HTTP {e.code}: {e.read().decode('utf-8')}")
    exit(1)
