import sys
import os
import codecs
import re
import json

# Set console encoding to UTF-8
if sys.platform == 'win32':
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'ignore')
    sys.stderr = codecs.getwriter('utf-8')(sys.stderr.buffer, 'ignore')

# Typical OCR text from Moulime Q S.A.R.L. invoice based on user's description
typical_moulime_text = """
Moulime Q S.A.R.L.

BON DE LIVRAISON N°: 2026004449
31/07/2026

Code Client: 002254
Commande N°: 2026004382
Livreur: BERRAIS KHALIL

Client: GHILANI MED
Adresse: KHNIFRA - MAROC
Tél: 0610207746

Code Article Désignation Qté P.U. Montant Tva
F-GRF375NFHX REF GRF375NFHX FITCO 1 4490.00 4490.00 20.00%
S-AR50F24C1RH/RC Inverter AI 24000 BTU MODEL 2025 1 7300.00 7300.00 20.00%
L-GR-8460PLGB REF LG 1 6650.00 6650.00 20.00%
L-GR-B522MQBM RÉFRIGÉRATEUR LG GR-B522MQBM 1 6350.00 6350.00 20.00%
S-RT30A31005A/MA REF SAMSUNG 1 4560.00 4560.00 20.00%
L-P2XSPYNYG MAL 8KG F2XSPYNYS 2 3750.00 7500.00 20.00%
L-F2XSPYN26 MAL 9KG F2XSFYN26 LG 2 4150.00 8300.00 20.00%
S-UA32H5000FUXMV LED 32 Pouces HD H5000 Smart TV 2 1430.00 2860.00 20.00%

TOTAL H.T.: 40008.34
TOTAL T.V.A.: 8001.66
TOTAL T.T.C.: 48010.00
"""

print("=" * 80)
print("TEST DU PARSER AVEC TEXTE FACTUEL MOULIME Q S.A.R.L.")
print("=" * 80)
print("\nTexte OCR simulé:")
print("-" * 80)
print(typical_moulime_text[:300])
print("-" * 80)

# Implement the JavaScript parser logic in Python for testing
def parse_price(price_str):
    if not price_str:
        return 0
    cleaned = price_str.replace(',', '.')
    return float(cleaned) if cleaned else 0

def parse_percentage(percent_str):
    if not percent_str:
        return 20
    cleaned = percent_str.replace('%', '').replace(',', '.')
    parsed = float(cleaned)
    return parsed if parsed > 0 else 20

def is_valid_item(item):
    return (item and 
            item.get('quantite', 0) > 0 and item.get('quantite', 0) < 1000 and
            item.get('prixUnitaire', 0) > 0 and item.get('prixUnitaire', 0) < 1000000 and
            item.get('designation') and len(item.get('designation', '')) > 2)

def create_item(designation, quantite, prixUnitaire, tauxTVA):
    montantHT = quantite * prixUnitaire
    montantTVA = montantHT * (tauxTVA / 100)
    
    return {
        'reference': None,
        'designation': re.sub(r'\s+', ' ', designation).strip()[:100],
        'quantite': quantite,
        'prixUnitaire': prixUnitaire,
        'tauxTVA': tauxTVA,
        'montantHT': montantHT,
        'montantTVA': montantTVA,
        'montantTTC': montantHT + montantTVA
    }

def parse_structured_line(texte, lines):
    items = []
    patterns = [
        # REF DESIGNATION QTY PRICE AMOUNT TVA
        re.compile(r'^([A-Z0-9\-]+)\s+([A-Z][A-Z\s\d\/\-]{3,40})\s+(\d{1,3})\s*[\)\]\}\s]*([\d,]+\.\d{2}|[\d,]+,\d{2})\s*[\)\]\}\s]*([\d,]+\.\d{2}|[\d,]+,\d{2})\s*[\)\]\}\s]*(\d+[.,]\d{2})%', re.IGNORECASE),
        # REF DESIGNATION QTY PRICE TVA
        re.compile(r'^([A-Z0-9\-]+)\s+([A-Z][A-Z\s\d\/\-]{3,30})\s+(\d{1,3})\s*[\)\]\}\s]*([\d,]+\.\d{2}|[\d,]+,\d{2})\s*[\)\]\}\s]*(\d+[.,]\d{2})%', re.IGNORECASE)
    ]

    for line in lines:
        trimmedLine = line.strip()
        if not trimmedLine or len(trimmedLine) < 10:
            continue

        for pattern in patterns:
            match = pattern.match(trimmedLine)
            if match:
                if len(match.groups()) >= 6:  # Full pattern
                    item = {
                        'reference': match.group(1).strip(),
                        'designation': match.group(2).strip(),
                        'quantite': int(match.group(3)),
                        'prixUnitaire': parse_price(match.group(4)),
                        'tauxTVA': parse_percentage(match.group(6)),
                    }
                elif len(match.groups()) >= 5:  # Partial pattern
                    item = {
                        'reference': match.group(1).strip(),
                        'designation': match.group(2).strip(),
                        'quantite': int(match.group(3)),
                        'prixUnitaire': parse_price(match.group(4)),
                        'tauxTVA': parse_percentage(match.group(5)),
                    }
                
                # Calculate amounts
                if item['quantite'] > 0 and item['prixUnitaire'] > 0:
                    item['montantHT'] = item['quantite'] * item['prixUnitaire']
                    item['montantTVA'] = item['montantHT'] * (item['tauxTVA'] / 100)
                    item['montantTTC'] = item['montantHT'] + item['montantTVA']
                
                # Clean designation
                if item.get('designation'):
                    item['designation'] = re.sub(r'\s+', ' ', item['designation']).strip()[:100]
                
                if is_valid_item(item):
                    items.append(item)
                break

    return items

def parse_partial_line(texte, lines):
    items = []
    patterns = [
        # DESIGNATION QTY PRICE TVA
        re.compile(r'^([A-Z][A-Z\s\d\/\-]{3,40})\s+(\d{1,3})\s*[\)\]\}\s]*([\d,]+\.\d{2}|[\d,]+,\d{2})\s*[\)\]\}\s]*(\d+[.,]\d{2})%', re.IGNORECASE),
        # More flexible
        re.compile(r'^([A-Z][A-Z\s\d\/\-]{2,40})\s+(\d{1,3})\s*[\)\]\}\s]*([\d,]+\.\d{2}|[\d,]+,\d{2})\s*[\)\]\}\s]*(\d+[.,]\d{2})%', re.IGNORECASE)
    ]

    for line in lines:
        trimmedLine = line.strip()
        if not trimmedLine or len(trimmedLine) < 8:
            continue

        for pattern in patterns:
            match = pattern.match(trimmedLine)
            if match:
                item = {
                    'reference': None,
                    'designation': match.group(1).strip(),
                    'quantite': int(match.group(2)),
                    'prixUnitaire': parse_price(match.group(3)),
                    'tauxTVA': parse_percentage(match.group(4)),
                }
                
                # Calculate amounts
                if item['quantite'] > 0 and item['prixUnitaire'] > 0:
                    item['montantHT'] = item['quantite'] * item['prixUnitaire']
                    item['montantTVA'] = item['montantHT'] * (item['tauxTVA'] / 100)
                    item['montantTTC'] = item['montantHT'] + item['montantTVA']
                
                # Clean designation
                if item.get('designation'):
                    item['designation'] = re.sub(r'\s+', ' ', item['designation']).strip()[:100]
                
                if is_valid_item(item):
                    items.append(item)
                break

    return items

def parse_simple_line(texte, lines):
    items = []
    patterns = [
        # TEXT QTY PRICE
        re.compile(r'^([A-Z][A-Z\s\d\/\-]{3,30})\s+(\d{1,3})\s*[\)\]\}\s]*([\d,]+\.\d{2}|[\d,]+,\d{2})', re.IGNORECASE),
        # More flexible
        re.compile(r'^([A-Z][A-Z\s\d\/\-]{2,30})\s+(\d{1,3})\s*[\)\]\}\s]*([\d,]+)', re.IGNORECASE)
    ]

    for line in lines:
        trimmedLine = line.strip()
        if not trimmedLine or len(trimmedLine) < 6:
            continue

        for pattern in patterns:
            match = pattern.match(trimmedLine)
            if match:
                item = {
                    'reference': None,
                    'designation': match.group(1).strip(),
                    'quantite': int(match.group(2)),
                    'prixUnitaire': parse_price(match.group(3)),
                    'tauxTVA': 20,
                }
                
                # Calculate amounts
                if item['quantite'] > 0 and item['prixUnitaire'] > 0:
                    item['montantHT'] = item['quantite'] * item['prixUnitaire']
                    item['montantTVA'] = item['montantHT'] * (item['tauxTVA'] / 100)
                    item['montantTTC'] = item['montantHT'] + item['montantTVA']
                
                # Clean designation
                if item.get('designation'):
                    item['designation'] = re.sub(r'\s+', ' ', item['designation']).strip()[:100]
                
                if is_valid_item(item):
                    items.append(item)
                break

    return items

def parse_number_patterns(texte, lines):
    items = []
    
    for line in lines:
        trimmedLine = line.strip()
        if not trimmedLine or len(trimmedLine) < 5:
            continue

        numbers = re.findall(r'[\d,]+(?:\.\d{2}|,\d{2})?', trimmedLine)
        if len(numbers) >= 2:
            quantity = int(numbers[0].replace(',', '.'))
            price = parse_price(numbers[1])
            
            textMatch = re.match(r'^([A-Z][A-Z\s\d\/\-]+)', trimmedLine, re.IGNORECASE)
            designation = textMatch.group(1).strip() if textMatch else 'Produit inconnu'

            if 0 < quantity < 1000 and 0 < price < 100000:
                montantHT = quantity * price
                montantTVA = montantHT * 0.20
                
                items.append({
                    'reference': None,
                    'designation': re.sub(r'\s+', ' ', designation)[:100],
                    'quantite': quantity,
                    'prixUnitaire': price,
                    'tauxTVA': 20,
                    'montantHT': montantHT,
                    'montantTVA': montantTVA,
                    'montantTTC': montantHT + montantTVA
                })

    return items

def remove_duplicate_items(items):
    seen = set()
    unique_items = []
    for item in items:
        key = item['designation'].lower()
        if key not in seen:
            seen.add(key)
            unique_items.append(item)
    return unique_items

# Test with different strategies
lines = typical_moulime_text.split('\n')

strategies = [
    ("Structured Line", parse_structured_line),
    ("Partial Line", parse_partial_line), 
    ("Simple Line", parse_simple_line),
    ("Number Patterns", parse_number_patterns)
]

print("\n" + "=" * 80)
print("TEST DES DIFFÉRENTES STRATÉGIES")
print("=" * 80)

for strategy_name, strategy_func in strategies:
    items = strategy_func(typical_moulime_text, lines)
    unique_items = remove_duplicate_items(items)
    valid_items = [item for item in unique_items if is_valid_item(item)]
    
    print(f"\n{strategy_name}: {len(valid_items)} items valides")
    if valid_items:
        for i, item in enumerate(valid_items[:2], 1):  # Show first 2 items
            print(f"  Item {i}: {item['designation'][:30]} | Qty: {item['quantite']} | Price: {item['prixUnitaire']}")
    else:
        print("  ❌ Aucun item valide extrait")

# Best strategy test
print("\n" + "=" * 80)
print("RÉSULTAT FINAL")
print("=" * 80)

all_items = []
for strategy_name, strategy_func in strategies:
    items = strategy_func(typical_moulime_text, lines)
    if items:
        all_items.extend(items)
        break  # Use first successful strategy

final_items = remove_duplicate_items(all_items)
valid_items = [item for item in final_items if is_valid_item(item)]

print(f"Nombre total d'items: {len(valid_items)}")
print("\nDétails des items:")
for i, item in enumerate(valid_items, 1):
    print(f"\nItem {i}:")
    print(f"  Référence: {item.get('reference', 'N/A')}")
    print(f"  Désignation: {item.get('designation', 'N/A')}")
    print(f"  Quantité: {item.get('quantite', 0)}")
    print(f"  Prix Unitaire: {item.get('prixUnitaire', 0):.2f}")
    print(f"  Taux TVA: {item.get('tauxTVA', 0):.2f}%")

# Calculate totals
total_ht = sum(item.get('montantHT', 0) for item in valid_items)
total_tva = sum(item.get('montantTVA', 0) for item in valid_items)
total_ttc = sum(item.get('montantTTC', 0) for item in valid_items)

print("\n" + "=" * 80)
print("TOTAUX")
print("=" * 80)
print(f"TOTAL H.T.: {total_ht:.2f}")
print(f"TOTAL T.V.A.: {total_tva:.2f}")
print(f"TOTAL T.T.C.: {total_ttc:.2f}")
print(f"\nAttendu: TOTAL H.T.: 40008.34, TOTAL T.V.A.: 8001.66, TOTAL T.T.C.: 48010.00")
print(f"Validation: {abs(total_ttc - 48010.00) < 100 if valid_items else 'ÉCHEC'}")