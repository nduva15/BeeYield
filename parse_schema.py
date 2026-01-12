import json
with open('schema.json', 'r') as f:
    data = json.load(f)
    tables = data.get('definitions', {}).keys()
    print("Tables list:")
    for t in sorted(tables):
        print(t)
