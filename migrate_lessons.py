import os
import re

components_dir = "frontend/src/components/Cacbaitoan10"
exclude = ["PremiumLessonEngine.js", "LessonVideoPlayer.js", "MathToolsPanel.js", "MathGraphSVG.js"]

# Resolve absolute path
base_dir = os.path.dirname(os.path.abspath(__file__))
target_dir = os.path.join(base_dir, components_dir)

files = [f for f in os.listdir(target_dir) if f.startswith("Lesson") and f.endswith(".js")]
files = [f for f in files if f not in exclude]

print(f"Scanning {len(files)} lesson files in {target_dir}...")

for filename in files:
    filepath = os.path.join(target_dir, filename)
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()
    
    # Check if already migrated
    if "PremiumLessonEngine" in content and "<PremiumLessonEngine" in content:
        print(f"[{filename}] Already migrated. Skipping.")
        continue
        
    print(f"[{filename}] Migrating...")
