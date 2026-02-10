import os

def search_files(directory, query):
    matches = []
    for root, dirs, files in os.walk(directory):
        if 'node_modules' in dirs:
            dirs.remove('node_modules')
        for file in files:
            if file.endswith(('.ts', '.tsx', '.sql', '.py')):
                path = os.path.join(root, file)
                try:
                    with open(path, 'r', encoding='utf-8') as f:
                        if query in f.read():
                            matches.append(path)
                except Exception:
                    pass
    return matches

results = search_files('c:\\Users\\aggym\\Downloads\\Honey', 'user_profiles')
print(f"Found {len(results)} matches for user_profiles.")
results2 = search_files('c:\\Users\\aggym\\Downloads\\Honey', 'profiles')
print(f"Found {len(results2)} matches for profiles.")
