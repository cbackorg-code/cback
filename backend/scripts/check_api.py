import urllib.request
import json

API = "http://localhost:8000"

# 1. Check Starbucks via live API
print("=== Starbucks via Live API ===")
req = urllib.request.Request(f"{API}/entries/?search=Starbucks")
with urllib.request.urlopen(req) as resp:
    data = json.loads(resp.read().decode())
    for e in data:
        print(f"  Name: {e['statement_name']}")
        print(f"  Status: {e['status']}")
        print(f"  upvote_count: {e['upvote_count']}")
        print(f"  downvote_count: {e['downvote_count']}")
        entry_id = e['id']

        # Single entry endpoint
        print(f"\n  --- Single Entry API ---")
        req2 = urllib.request.Request(f"{API}/entries/{entry_id}")
        with urllib.request.urlopen(req2) as resp2:
            e2 = json.loads(resp2.read().decode())
            print(f"  Name: {e2['statement_name']}")
            print(f"  Status: {e2['status']}")
            print(f"  upvote_count: {e2['upvote_count']}")
            print(f"  downvote_count: {e2['downvote_count']}")

# 2. Check Amazon
print("\n=== Amazon via Live API ===")
req = urllib.request.Request(f"{API}/entries/?search=Amazon")
with urllib.request.urlopen(req) as resp:
    data = json.loads(resp.read().decode())
    for e in data:
        print(f"  Name: {e['statement_name']}")
        print(f"  Status: {e['status']}")
        print(f"  upvote_count: {e['upvote_count']}")
        print(f"  downvote_count: {e['downvote_count']}")
