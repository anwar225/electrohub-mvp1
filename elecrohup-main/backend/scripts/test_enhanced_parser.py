import sys
import os
import codecs
import re
import json

# Set console encoding to UTF-8
if sys.platform == 'win32':
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'ignore')
    sys.stderr = codecs.getwriter('utf-8')(sys.stderr.buffer, 'ignore')

# Read the Tesseract output
tesseract_output = os.path.join(os.path.dirname(__file__), 'tesseract_output.txt')
with open(tesseract_output, 'r', encoding='utf-8', errors='ignore') as f:
    texte = f.read()

print("=" * 80)
print("TEST DU PARSER AMÉLIORÉ POUR FACTURES MAROCAINES")
print("=" * 80)
print("\nTexte OCR extrait (premiers 500 caractères):")
print("-" * 80)
print(texte[:500])
print("-" * 80)

# Implement the enhanced parser in Python for testing
def parse_price(price_str):
    if not price_str:
        return 0
    cleaned = price_str.replace(',', '.')
    return float(cleaned) if cleaned else 0

def parse_percentage(percent_str):
    if not percent_str:
        return 0
    cleaned = percent_str.replace('%', '').replace(',', '.')
    return float(cleaned) if cleaned else 0

def is_valid_item(item):
    return (item and 
            item.get('quantite', 0) > 0 and item.get('quantite', 0) < 100 and
            item.get('prixUnitaire', 0) > 0 and item.get('prixUnitaire', 0) < 100000 and
            item.get('designation') and len(item.get('designation', '')) > 2)

def parse_matched_line(match, pattern_type):
    try:
        item = {
            'reference': None,
            'designation': None,
            'quantite': 0,
            'prixUnitaire': 0,
            'tauxTVA': 0,
            'montantHT': 0,
            'montantTVA': 0,
            'montantTTC': 0
        }
        
        # Pattern 1: REF DESIGNATION QTY PRICE AMOUNT TVA
        if pattern_type == 1 and len(match) == 7:
            item['reference'] = match[1].strip()
            item['designation'] = match[2].strip()
            item['quantite'] = int(match[3])
            item['prixUnitaire'] = parse_price(match[4])
            item['tauxTVA'] = parse_percentage(match[6])
        # Pattern 2: REF DESIGNATION QTY PRICE TVA
        elif pattern_type == 2 and len(match) == 6:
            item['reference'] = match[1].strip()
            item['designation'] = match[2].strip()
            item['quantite'] = int(match[3])
            item['prixUnitaire'] = parse_price(match[4])
            item['tauxTVA'] = parse_percentage(match[5])
        # Pattern 3: DESIGNATION QTY PRICE TVA
        elif pattern_type == 3 and len(match) == 5:
            item['designation'] = match[1].strip()
            item['quantite'] = int(match[2])
            item['prixUnitaire'] = parse_price(match[3])
            item['tauxTVA'] = parse_percentage(match[4])
        # Pattern 4: Flexible pattern - same as pattern 3
        elif pattern_type == 4 and len(match) == 5:
            item['designation'] = match[1].strip()
            item['quantite'] = int(match[2])
            item['prixUnitaire'] = parse_price(match[3])
            item['tauxTVA'] = parse_percentage(match[4])
        
        # Calculate amounts
        if item['quantite'] > 0 and item['prixUnitaire'] > 0:
            item['montantHT'] = item['quantite'] * item['prixUnitaire']
            item['montantTVA'] = item['montantHT'] * (item['tauxTVA'] / 100)
            item['montantTTC'] = item['montantHT'] + item['montantTVA']
        
        # Clean designation
        if item['designation']:
            item['designation'] = re.sub(r'\s+', ' ', item['designation']).strip()[:100]
        
        return item
    except Exception as e:
        print(f"Error parsing matched line: {e}")
        return None

def parse_tableau_facture(texte):
    items = []
    lines = texte.split('\n')
    
    # Enhanced patterns for Moroccan invoice structure
    line_patterns = [
        # Pattern 1: Full line: REF DESIGNATION QTY PRICE AMOUNT TVA
        (re.compile(r'^([A-Z0-9\-]+)\s+([A-Z][A-Z\s\d\/\-]{3,40})\s+(\d{1,2})\s+([\d,]+\.\d{2}|[\d,]+,\d{2})\s+([\d,]+\.\d{2}|[\d,]+,\d{2})\s+(\d+[.,]\d{2})%', re.IGNORECASE), 1),
        # Pattern 2: REF DESIGNATION QTY PRICE TVA
        (re.compile(r'^([A-Z0-9\-]+)\s+([A-Z][A-Z\s\d\/\-]{3,30})\s+(\d{1,2})\s+([\d,]+\.\d{2}|[\d,]+,\d{2})\s+(\d+[.,]\d{2})%', re.IGNORECASE), 2),
        # Pattern 3: DESIGNATION QTY PRICE TVA
        (re.compile(r'^([A-Z][A-Z\s\d\/\-]{3,30})\s+(\d{1,2})\s+([\d,]+\.\d{2}|[\d,]+,\d{2})\s+(\d+[.,]\d{2})%', re.IGNORECASE), 3),
        # Pattern 4: Flexible pattern for messy OCR
        (re.compile(r'^([A-Z][A-Z\s\d\/\-]{2,40})\s+(\d{1,2})\s+([\d,]+\.\d{2}|[\d,]+,\d{2})\s+(\d+[.,]\d{2})%', re.IGNORECASE), 4)
    ]
    
    for line in lines:
        trimmed_line = line.strip()
        if not trimmed_line or len(trimmed_line) < 10:
            continue
        
        # Try each pattern
        for pattern, pattern_type in line_patterns:
            match = pattern.match(trimmed_line)
            if match:
                item = parse_matched_line(match, pattern_type)
                if item and is_valid_item(item):
                    items.append(item)
                    break  # Move to next line after successful match
    
    # Fallback if no items found
    if not items:
        print("No items found with structured patterns, trying fallback...")
        items = extract_items_fallback(texte)
    
    return items

def extract_items_fallback(texte):
    items = []
    fallback_patterns = [
        # Pattern: Product name + Quantity + Price + TVA
        (re.compile(r'([A-Z][A-Z\s]{3,30})\s+(\d{1,2})\s+([\d,]+\.\d{2}|[\d,]+,\d{2})\s+(\d+[.,]\d{2})%', re.IGNORECASE), True),
        # Pattern: Product name + Quantity + Price
        (re.compile(r'([A-Z][A-Z\s]{3,30})\s+(\d{1,2})\s+([\d,]+\.\d{2}|[\d,]+,\d{2})', re.IGNORECASE), False)
    ]
    
    seen_items = set()
    
    for pattern, has_tva in fallback_patterns:
        for match in pattern.finditer(texte):
            product_name = match.group(1).strip()
            quantity = int(match.group(2))
            price = parse_price(match.group(3))
            tva = parse_percentage(match.group(4)) if has_tva and len(match.groups()) >= 4 else 20
            
            if (product_name and 
                0 < quantity < 100 and 
                0 < price < 100000 and 
                product_name not in seen_items):
                
                seen_items.add(product_name)
                montant_ht = quantity * price
                montant_tva = montant_ht * (tva / 100)
                
                items.append({
                    'reference': None,
                    'designation': product_name[:50],
                    'quantite': quantity,
                    'prixUnitaire': price,
                    'tauxTVA': tva,
                    'montantHT': montant_ht,
                    'montantTVA': montant_tva,
                    'montantTTC': montant_ht + montant_tva
                })
    
    return items

# Parse the invoice
print("\n" + "=" * 80)
print("RÉSULTATS DU PARSING")
print("=" * 80)

items = parse_tableau_facture(texte)

print(f"\nNombre d'items extraits: {len(items)}")
print("\nDétails des items:")
print("-" * 80)

for i, item in enumerate(items, 1):
    print(f"\nItem {i}:")
    print(f"  Référence: {item.get('reference', 'N/A')}")
    print(f"  Désignation: {item.get('designation', 'N/A')}")
    print(f"  Quantité: {item.get('quantite', 0)}")
    print(f"  Prix Unitaire: {item.get('prixUnitaire', 0):.2f}")
    print(f"  Taux TVA: {item.get('tauxTVA', 0):.2f}%")
    print(f"  Montant HT: {item.get('montantHT', 0):.2f}")
    print(f"  Montant TVA: {item.get('montantTVA', 0):.2f}")
    print(f"  Montant TTC: {item.get('montantTTC', 0):.2f}")

# Calculate totals
total_ht = sum(item.get('montantHT', 0) for item in items)
total_tva = sum(item.get('montantTVA', 0) for item in items)
total_ttc = sum(item.get('montantTTC', 0) for item in items)

print("\n" + "=" * 80)
print("TOTAUX")
print("=" * 80)
print(f"TOTAL H.T.: {total_ht:.2f}")
print(f"TOTAL T.V.A.: {total_tva:.2f}")
print(f"TOTAL T.T.C.: {total_ttc:.2f}")

print("\n" + "=" * 80)
print("VALIDATION")
print("=" * 80)
print(f"✓ Nombre d'items: {len(items)}")
print(f"✓ TOTAL T.T.C. calculé: {total_ttc:.2f}")
print(f"✓ Validation: TOTAL T.T.C. = TOTAL H.T. + TOTAL T.V.A.: {abs(total_ttc - (total_ht + total_tva)) < 0.01}")

# Export to JSON for review
result = {
    'items': items,
    'totaux': {
        'montantHT': total_ht,
        'montantTVA': total_tva,
        'montantTTC': total_ttc
    }
}

print("\n" + "=" * 80)
print("EXPORT JSON")
print("=" * 80)
print(json.dumps(result, indent=2, ensure_ascii=False))