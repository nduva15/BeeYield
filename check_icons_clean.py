import os
import re
import sys

# Force utf-8 output
sys.stdout.reconfigure(encoding='utf-8')

def check_lucide_imports(file_path):
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        return []
    
    # Find lucide-react import block
    import_match = re.search(r'import\s+\{(.*?)\}\s+from\s+["\']lucide-react["\']', content, re.DOTALL)
    if not import_match:
        return []
    
    imported_icons = [i.strip() for i in import_match.group(1).split(',')]
    
    # Find all potential icon usages in JSX <Icon ... or {Icon}
    found_icons = re.findall(r'<([A-Z][a-zA-Z0-9]+)', content)
    found_icons += re.findall(r'[iI]con[:=]\{([A-Z][a-zA-Z0-9]+)\}', content)
    
    missing = []
    for icon in set(found_icons):
        if icon in ['Button', 'Card', 'Badge', 'Tabs', 'TabsList', 'TabsTrigger', 'TabsContent', 'Select', 'SelectTrigger', 'SelectValue', 'SelectContent', 'SelectItem', 'Input', 'Dialog', 'DialogContent', 'DialogHeader', 'DialogTitle', 'DialogDescription', 'Link', 'BrandedProductImage', 'PDFDownloadLink', 'HoneyTracePDF']:
            continue
        
        if icon in imported_icons:
            continue
        
        # Heuristic check for icon names
        if any(keyword in icon for keyword in ['Arrow', 'Check', 'Circle', 'User', 'Mail', 'Lock', 'Shield', 'Chevron', 'External', 'Briefcase', 'Graduation', 'Lightbulb', 'Target', 'Globe', 'Zap', 'Cpu', 'Activity', 'Shopping', 'Heart', 'Star', 'Filter', 'Loader', 'X', 'Search', 'Qr', 'Map', 'Calendar', 'Leaf', 'Info', 'Home', 'Droplets', 'Box', 'Thermometer', 'Wave', 'File', 'Wheat', 'Tree', 'Scale', 'Award', 'Menu', 'Truck', 'Smile', 'Frown', 'Meh']):
           missing.append(icon)
           
    return missing

src_dir = r'c:\Users\aggym\Downloads\Honey\src'

print("--- START REPORT ---")
for root, dirs, files in os.walk(src_dir):
    for file in files:
        if file.endswith('.tsx'):
            path = os.path.join(root, file)
            missing = check_lucide_imports(path)
            if missing:
                print(f"FILE: {path}")
                print(f"MISSING: {', '.join(missing)}")
print("--- END REPORT ---")
