import os

def search_files(directory, query):
    matches = []
    for root, dirs, files in os.walk(directory):
        if 'node_modules' in dirs:
            dirs.remove('node_modules')
        if '.git' in dirs:
            dirs.remove('.git')
        for file in files:
            if file.endswith('.sql'):
                path = os.path.join(root, file)
                try:
                    with open(path, 'r', encoding='utf-8') as f:
                        if query in f.read():
                            matches.append(path)
                except Exception as e:
                    print(f"Error reading {path}: {e}")
    return matches

results = search_files('c:\\Users\\aggym\\Downloads\\Honey', 'Admin all access')
print(f"Found {len(results)} matches:")
for r in results:
    print(r)
