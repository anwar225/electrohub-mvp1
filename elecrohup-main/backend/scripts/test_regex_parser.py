import sys
import os
import codecs

# Set console encoding to UTF-8
if sys.platform == 'win32':
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'ignore')
    sys.stderr = codecs.getwriter('utf-8')(sys.stderr.buffer, 'ignore')

# Add the parent directory to the path to import the regex parser
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

# Read the Tesseract output
tesseract_output = os.path.join(os.path.dirname(__file__), 'tesseract_output.txt')
with open(tesseract_output, 'r', encoding='utf-8', errors='ignore') as f:
    texte = f.read()

print("Testing regex parser with extracted text:")
print("-" * 50)
print(texte[:500])  # Print first 500 chars
print("-" * 50)

# We'll need to implement a simple regex parser in Python for testing
import re

def parse_facture_regex(texte):
    result = {
        'numeroFacture': None,
        'date': None,
        'fournisseur': None,
        'items': [],
        'montantTTC': 0
    }
    
    # Extract invoice number (more specific patterns)
    invoice_patterns = [
        r'BON\s+DE\s+LIVRAISON\s+N[°\s:]+(\d+)',
        r'N[°\s:]+(\d{8,})',
        r'(?:FAC|FACTURE)\s*[-:\s]*(\d+)'
    ]
    
    for pattern in invoice_patterns:
        match = re.search(pattern, texte, re.IGNORECASE)
        if match and len(match.group(1)) >= 4:
            result['numeroFacture'] = match.group(1).strip()
            break
    
    # Extract date
    date_patterns = [
        r'(\d{2})/(\d{2})/(\d{4})',
        r'(\d{4})-(\d{2})-(\d{2})'
    ]
    
    for pattern in date_patterns:
        match = re.search(pattern, texte)
        if match:
            if '/' in match.group(0):
                result['date'] = f"{match.group(3)}-{match.group(2)}-{match.group(1)}"
            else:
                result['date'] = match.group(0)
            break
    
    # Extract supplier (more specific patterns)
    supplier_patterns = [
        r'^([A-Z][A-Z\s\.]{5,30})$',
        r'([A-Z][A-Z\s]+S\.A\.R\.L)',
        r'([A-Z][A-Z\s]+CIE)'
    ]
    
    for pattern in supplier_patterns:
        match = re.search(pattern, texte, re.MULTILINE | re.IGNORECASE)
        if match and 3 < len(match.group(1)) < 50:
            result['fournisseur'] = match.group(1).strip()
            break
    
    # Extract items (more specific patterns)
    item_patterns = [
        r'([A-Z][A-Z\s]{3,30})\s+(\d{1,2})\s+([\d,]+\.\d{2})',
        r'([A-Z][A-Z\s]{3,20})\s+(\d{1,2})\s+([\d,]+)'
    ]
    
    seen_items = set()
    
    for pattern in item_patterns:
        for match in re.finditer(pattern, texte, re.IGNORECASE):
            product_name = match.group(1).strip()
            quantity = int(match.group(2))
            price = float(match.group(3).replace(',', '.'))
            
            # Validate item data
            if (product_name and 
                0 < quantity < 100 and 
                0 < price < 100000 and 
                product_name not in seen_items):
                
                seen_items.add(product_name)
                result['items'].append({
                    'nom': product_name[:50],
                    'quantite': quantity,
                    'prixUnitaire': price
                })
    
    # Calculate total
    result['montantTTC'] = sum(item['quantite'] * item['prixUnitaire'] for item in result['items'])
    
    # Try to extract total directly
    total_patterns = [
        r'(?:Total\s+TTC|TTC|Montant\s+TTC)\s*[:\-]?\s*([\d,\.]+)',
        r'([\d,]+\.\d{2})\s*(?:TTC|Total)'
    ]
    
    for pattern in total_patterns:
        match = re.search(pattern, texte, re.IGNORECASE)
        if match:
            direct_total = float(match.group(1).replace(',', '.'))
            if 0 < direct_total < 1000000 and direct_total > result['montantTTC']:
                result['montantTTC'] = direct_total
            break
    
    # Fallback values
    if not result['numeroFacture']:
        result['numeroFacture'] = f"FAC-{int(__import__('time').time())}"
    if not result['date']:
        result['date'] = __import__('datetime').datetime.now().strftime('%Y-%m-%d')
    if not result['fournisseur']:
        result['fournisseur'] = "Fournisseur inconnu"
    
    # Limit items
    if len(result['items']) > 20:
        result['items'] = result['items'][:20]
    
    return result

# Test the parser
parsed = parse_facture_regex(texte)
print("Parsed result:")
import json
print(json.dumps(parsed, indent=2, ensure_ascii=False))