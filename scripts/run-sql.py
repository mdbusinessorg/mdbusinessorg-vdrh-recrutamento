import json, os, sys, urllib.request, urllib.error

def main():
    if len(sys.argv) < 2:
        print("Usage: run-sql.py <SQL file>")
        sys.exit(1)
    token = os.environ.get("SUPABASE_ACCESS_TOKEN")
    ref = "noywnuafpxvxvmfkjtbh"
    url = f"https://api.supabase.com/v1/projects/{ref}/database/query"
    with open(sys.argv[1], "r", encoding="utf-8") as f:
        query = f.read()
    body = json.dumps({"query": query}).encode("utf-8")
    req = urllib.request.Request(url, data=body, headers={
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
        "User-Agent": "MosaloCron/1.0",
    }, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=120) as resp:
            print(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        print(f"HTTP {e.code}: {e.read().decode('utf-8')}")
        sys.exit(1)

if __name__ == "__main__":
    main()
