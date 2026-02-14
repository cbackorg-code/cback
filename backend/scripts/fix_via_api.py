import urllib.request
import json

API = "http://localhost:8000"

def get_entries(search):
    url = f"{API}/entries/?search={search}"
    req = urllib.request.Request(url)
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode())

def set_votes(entry_id, upvotes, downvotes, status):
    url = f"{API}/votes/admin/set-votes/{entry_id}"
    data = json.dumps({"upvotes": upvotes, "downvotes": downvotes, "status": status}).encode()
    req = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json"}, method="POST")
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode())

# 1. Reset Starbucks
print("=== Resetting Starbucks ===")
starbucks = get_entries("Starbucks")
for e in starbucks:
    print(f"  Found: {e['statement_name']} (ID: {e['id']}) | Currently: Up={e['upvote_count']} Down={e['downvote_count']} Status={e['status']}")
    result = set_votes(e['id'], 0, 0, "pending")
    print(f"  -> Updated: {result}")

# 2. Verify Amazon Pay
print("\n=== Verifying Amazon Pay ===")
amazon = get_entries("Amazon")
for e in amazon:
    print(f"  Found: {e['statement_name']} (ID: {e['id']}) | Currently: Up={e['upvote_count']} Down={e['downvote_count']} Status={e['status']}")
    result = set_votes(e['id'], 5, 0, "verified")
    print(f"  -> Updated: {result}")

# 3. Verify final state
print("\n=== Final Verification ===")
for search in ["Starbucks", "Amazon"]:
    entries = get_entries(search)
    for e in entries:
        print(f"  {e['statement_name']} | Up={e['upvote_count']} Down={e['downvote_count']} Status={e['status']}")
