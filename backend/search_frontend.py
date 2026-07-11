import os

search_dir = r"c:\Users\Latitude 7300\OneDrive\Máy tính\duosteam - Copy\duosteam\frontend\src"
search_term = "circ"

found = False
for root, dirs, files in os.walk(search_dir):
    for file in files:
        if file.endswith(".js") or file.endswith(".jsx") or file.endswith(".ts") or file.endswith(".tsx"):
            filepath = os.path.join(root, file)
            try:
                with open(filepath, "r", encoding="utf-8") as f:
                    content = f.read()
                if search_term in content:
                    print(f"Match found in: {filepath}")
                    # Find all lines with search_term
                    lines = content.splitlines()
                    for idx, line in enumerate(lines):
                        if search_term in line:
                            print(f"  Line {idx+1}: {line.strip()}")
                    found = True
            except Exception as e:
                pass

if not found:
    print("No matches found in frontend/src")
