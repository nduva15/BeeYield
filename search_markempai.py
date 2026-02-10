
import os

def search():
    for root, dirs, files in os.walk("."):
        if "node_modules" in dirs:
            dirs.remove("node_modules")
        if ".git" in dirs:
            dirs.remove(".git")
        for file in files:
            if file.endswith((".ts", ".tsx", ".js", ".jsx", ".json", ".sql", ".py", ".md", ".txt")):
                path = os.path.join(root, file)
                try:
                    with open(path, "r", encoding="utf-8") as f:
                        content = f.read()
                        if "Markempai" in content:
                            print(f"Found in {path}")
                except:
                    pass

if __name__ == "__main__":
    search()
