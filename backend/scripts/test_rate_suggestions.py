
import urllib.request
import urllib.parse
import json
import ssl

BASE_URL = "http://localhost:8000"
TOKEN_HEADER = {"Authorization": "Bearer demo-token", "Content-Type": "application/json"}

# Bypass SSL verification if needed (for localhost sometimes)
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
            return response.status, json.loads(response.read().decode())
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read().decode())
    except Exception as e:
        print(f"Error: {e}")
        return 500, {}

# 1. Get an Entry
# Try generic search
import sys
url = f"{BASE_URL}/entries?search=s"
print(f"Requesting: {url}")
status, results = make_request(url)

if not results or len(results) == 0:
    print("No entries found via search. Attempting to seed a test entry...")
    # Get a card first
    status, cards = make_request(f"{BASE_URL}/cards/")
    if not cards:
        print("No cards found. Cannot create entry.")
        exit()
    
    card_id = cards[0]['id']
    
    # Create Entry
    payload = {
        "statement_name": "Test Entry For Suggestions",
        "card_id": card_id,
        "source_sheet": "sbi-cashback" # fallback
    }
    status, new_entry = make_request(f"{BASE_URL}/entries/", "POST", payload, TOKEN_HEADER)
    if status > 299:
        print(f"Failed to create test entry: {status}, {new_entry}")
        exit()
    
    # The create endpoint might return None or the object. 
    # If None, we search again.
    status, results = make_request(f"{BASE_URL}/entries?search=Test Entry")
    if not results:
         print("Created entry but cannot find it.")
         exit()

try:
    if isinstance(results, list) and len(results) > 0:
        entry_id = results[0]['id']
    else:
        print(f"Unexpected results format: {type(results)}")
        print(f"Content: {results}")
        exit()
except Exception as e:
    print(f"Error parsing entry ID: {e}")
    print(f"Results: {results}")
    exit()

print(f"Testing on Entry ID: {entry_id}")

# 2. Create Suggestion (User A)
print("\n--- User A: Suggesting 12.5% ---")
payload = {"proposed_rate": 12.5, "reason": "Test script suggestion"}
url = f"{BASE_URL}/entries/{entry_id}/suggestions"
print(f"Requesting: {url}")
status, res = make_request(url, "POST", payload, TOKEN_HEADER)
print(f"Status: {status}")
print(f"Response: {res}")

# 3. Try Duplicate (User A) - Should Fail "Already pending" (Limit 1)
print("\n--- User A: Suggesting 15% (Should Fail - Limit 1) ---")
payload2 = {"proposed_rate": 15.0, "reason": "Spam"}
status, res = make_request(f"{BASE_URL}/entries/{entry_id}/suggestions", "POST", payload2, TOKEN_HEADER)
print(f"Status: {status}")
print(f"Response: {res}")

# 4. Try Same Rate (User A) - Should Fail "Already suggested"
print("\n--- User A: Suggesting 12.5% again (Should Fail - Self Duplicate) ---")
status, res = make_request(f"{BASE_URL}/entries/{entry_id}/suggestions", "POST", payload, TOKEN_HEADER)
print(f"Status: {status}")
print(f"Response: {res}")
