
import urllib.request
import json
import traceback
import sys

URL = "http://localhost:8000/entries/?offset=0&limit=100&card_id=db72433b-0f78-4a30-b9ec-00aea87c5f92"
# Note: card_id might not exist in my local DB, so I'll try generic /entries/ first
URL_GENERIC = "http://localhost:8000/entries/"

def run():
    print(f"Requesting {URL_GENERIC}...")
    try:
        with urllib.request.urlopen(URL_GENERIC) as response:
            print(f"Status: {response.status}")
            print(response.read().decode())
    except urllib.error.HTTPError as e:
        print(f"HTTP Error: {e.code}")
        print(e.read().decode())
    except Exception:
        traceback.print_exc()

if __name__ == "__main__":
    run()
