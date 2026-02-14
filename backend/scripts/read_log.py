
import sys

def sanitize(text):
    return text.encode('ascii', 'replace').decode('ascii')

try:
    with open(r"d:\cback\backend\debug_output_get.txt", "r", encoding="utf-16") as f:
        lines = f.readlines()
        print(f"--- All {len(lines)} lines ---")
        for i, line in enumerate(lines):
            if "Caught" in line or "Traceback" in line or "Error" in line:
                print(f"Match at line {i}:")
                # Print 0 lines before (to avoid noise) and 50 lines after
                start = i
                end = min(len(lines), i + 50)
                for j in range(start, end):
                    print(sanitize(lines[j].strip()))
                print("-" * 20)
except Exception as e:
    print(f"Error reading: {e}")

