import sqlite3
import os
import json

db_path = r"c:\Users\Latitude 7300\OneDrive\Máy tính\duosteam - Copy\duosteam\backend\duomath.db"
if not os.path.exists(db_path):
    print("Database not found")
    exit(1)

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

cursor.execute("PRAGMA table_info(lessons);")
columns = [col[1] for col in cursor.fetchall()]
print("Columns in lessons:", columns)

cursor.execute("SELECT id, title, content FROM lessons WHERE content LIKE '%circ%';")
matching_lessons = cursor.fetchall()
print(f"Found {len(matching_lessons)} lessons containing 'circ':")
for lid, title, content in matching_lessons:
    print(f"Lesson ID: {lid}, Title: {title}")
    # Try parsing and looking for circ
    if "circ" in content:
        # Print a snippet of content where circ is located
        idx = content.find("circ")
        start = max(0, idx - 100)
        end = min(len(content), idx + 100)
        print(f"  Snippet: ... {content[start:end]} ...")

conn.close()
