import os
import re

def check_lucide_imports(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Find lucide-react import block
    import_match = re.search(r'import\s+\{(.*?)\}\s+from\s+["\']lucide-react["\']', content, re.DOTALL)
    if not import_match:
        return []
    
    imported_icons = [i.strip() for i in import_match.group(1).split(',')]
    
    # Find all potential icon usages in JSX <Icon ... or {Icon}
    # This is a bit simplified but usually works
    found_icons = re.findall(r'<([A-Z][a-zA-Z0-9]+)', content)
    # Also check for icon={Icon} or {Icon}
    found_icons += re.findall(r'[iI]con[:=]\{([A-Z][a-zA-Z0-9]+)\}', content)
    
    missing = []
    for icon in set(found_icons):
        # Common non-icon components to ignore
        if icon in ['Button', 'Card', 'Badge', 'Tabs', 'TabsList', 'TabsTrigger', 'TabsContent', 'Select', 'SelectTrigger', 'SelectValue', 'SelectContent', 'SelectItem', 'Input', 'Dialog', 'DialogContent', 'DialogHeader', 'DialogTitle', 'DialogDescription', 'Link', 'BrandedProductImage', 'PDFDownloadLink', 'HoneyTracePDF']:
            continue
        
        # Check if it starts with a Lucide-like name (this is a heuristic)
        # Most lucide icons are CamelCase and match imported names
        if icon in imported_icons:
            continue
        
        # If it looks like an icon but isn't imported
        if any(keyword in icon for keyword in ['Arrow', 'Check', 'Circle', 'User', 'Mail', 'Lock', 'Shield', 'Chevron', 'External', 'Briefcase', 'Graduation', 'Lightbulb', 'Target', 'Globe', 'Zap', 'Cpu', 'Activity', 'Shopping', 'Heart', 'Star', 'Filter', 'Loader', 'X', 'Search', 'Qr', 'Map', 'Calendar', 'Leaf', 'Info', 'Home', 'Droplets', 'Box', 'Thermometer', 'Wave', 'File', 'Wheat', 'Tree', 'Scale', 'Award', 'Menu', 'Truck']):
           missing.append(icon)
           
    return missing

src_dir = r'c:\Users\aggym\Downloads\Honey\src'
all_missing = {}

for root, dirs, files in os.walk(src_dir):
    for file in files:
        if file.endswith('.tsx'):
            path = os.path.join(root, file)
            missing = check_lucide_imports(path)
            if missing:
                all_missing[path] = missing

for path, missing in all_missing.items():
    print(f"{path}: {missing}")
