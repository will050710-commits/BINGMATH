import os
import re

app_dir = r"c:\Users\Latitude 7300\OneDrive\Máy tính\duosteam - Copy\duosteam\frontend\src\app"

for root, dirs, files in os.walk(app_dir):
    for f in files:
        if f == "page.js":
            filepath = os.path.join(root, f)
            with open(filepath, "r", encoding="utf-8") as file:
                content = file.read()
            
            if "<<<<<<< HEAD" in content:
                new_content = re.sub(
                    r"<<<<<<<\s*HEAD\n.*?=======\n(.*?)\n>>>>>>>\s*[a-f0-9]+",
                    r"\1",
                    content,
                    flags=re.DOTALL
                )
                
                if new_content != content:
                    with open(filepath, "w", encoding="utf-8") as file:
                        file.write(new_content)
                    print(f"Fixed {filepath}")
