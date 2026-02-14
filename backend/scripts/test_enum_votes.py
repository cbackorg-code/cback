
import urllib.request
import urllib.parse
import json
import ssl
import uuid
import sys

BASE_URL = "http://localhost:8003"
TOKEN_HEADER = {"Authorization": "Bearer demo-token", "Content-Type": "application/json"}

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

def make_request(url, method="GET", data=None, headers={}):
    try:
        req = urllib.request.Request(url, method=method)
        for k, v in headers.items():
            req.add_header(k, v)
        
        if data:
            req.data = json.dumps(data).encode('utf-8')
            
        with urllib.request.urlopen(req, context=ctx) as response:
            content = response.read().decode()
            try:
                return response.status, json.loads(content)
            except json.JSONDecodeError:
                print(f"Failed to decode JSON. Raw content: {content}")
                return response.status, content
    except urllib.error.HTTPError as e:
        content = e.read().decode()
        try:
            return e.code, json.loads(content)
        except json.JSONDecodeError:
            print(f"Failed to decode JSON error. Raw content: {content}")
            return e.code, content
    except Exception as e:
        print(f"Error: {e}")
        return 500, {}

# 1. Get a Card for creation
status, cards = make_request(f"{BASE_URL}/cards/")
if not cards:
    print("No cards found.")
    exit(1)
card_id = cards[0]['id']

# 2. Create Unique Entry
unique_name = f"EnumTest_{uuid.uuid4()}"
print(f"Creating Entry: {unique_name}")
payload = {
    "statement_name": unique_name,
    "card_id": card_id,
    "source_sheet": "sbi-cashback"
}
status, new_entry = make_request(f"{BASE_URL}/entries/", "POST", payload, TOKEN_HEADER)

# Fetch it to get ID
status, results = make_request(f"{BASE_URL}/entries?search={unique_name}")
if not results:
    print("Failed to find created entry.")
    exit(1)
entry_id = results[0]['id']
print(f"Entry ID: {entry_id}")

# 3. Create Suggestion
print("Creating Suggestion (Should use VoteType.UP implicitly or just string 'up' in DB)")
s_payload = {"proposed_rate": 10.0, "reason": "Enum Test"}
status, res = make_request(f"{BASE_URL}/entries/{entry_id}/suggestions", "POST", s_payload, TOKEN_HEADER)
print(f"Create Suggestion Status: {status}")
if status != 200:
    print(f"Response: {res}")
    exit(1)

suggestion_id = res['id']
print(f"Suggestion ID: {suggestion_id}")

# 4. Vote on Suggestion (This hits vote_rate_suggestion which uses Enum)
# Note: User cannot vote on own suggestion? Let's try voting 'down' to switch?
# Or we just rely on creation success (which uses VoteType internally).
# Actually, creation uses `VoteType` only if auto-consolidating.
# Let's try to VOTE explicitly?
# But user authored it.
# Let's try to vote on the ENTRY itself (`vote_entry`).
print("Voting on Entry (Up)")
vote_payload = {"vote_type": "up"}
status, res = make_request(f"{BASE_URL}/votes/entries/{entry_id}", "POST", vote_payload, TOKEN_HEADER)
print(f"Vote Entry Status: {status}")
if status != 200:
    print(f"Response: {res}")
    exit(1)

print("Vote Entry Success!")
