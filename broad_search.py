
import os

def broad_search():
    results = []
    for root, dirs, files in os.walk("c:\\Users\\aggym\\Downloads\\Honey"):
        if ".git" in root or "node_modules" in root or ".next" in root or "dist" in root:
            continue
        for file in files:
            path = os.path.join(root, file)
            # Skip binary files
            if file.endswith(('.png', '.jpg', '.jpeg', '.gif', '.ico', '.pdf', '.zip', '.exe', '.dll')):
                continue
            try:
                with open(path, "r", encoding="utf-8", errors="ignore") as f:
                    content = f.read()
                    if "Markempai" in content or "markempai" in content:
                        results.append(path)
            except Exception as e:
                pass
    
    with open("broad_search_results.txt", "w") as f:
        for r in results:
            f.write(f"{r}\n")

if __name__ == "__main__":
    broad_search()
