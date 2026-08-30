const axios = require('axios');

const API_URL = 'http://localhost:3000';

async function testManualFacture() {
  try {
    // Create a new test user with random email
    const randomEmail = `test${Date.now()}@example.com`;
    const signupResponse = await axios.post(`${API_URL}/api/auth/signup`, {
      nom: 'Test User',
      email: randomEmail,
      password: 'password123'
    });
    
    const token = signupResponse.data.token;
    console.log('✓ Test user created and logged in');
    
    // Test creating a manual facture
    const factureData = {
      numero: 'FAC-TEST-001',
      date: new Date().toISOString(),
      fournisseurNom: 'Test Fournisseur',
      items: [
        {
          designation: 'Produit Test 1',
          quantite: 2,
          prixUnitaire: 100,
          tauxTVA: 20
        },
        {
          designation: 'Produit Test 2',
          quantite: 3,
          prixUnitaire: 50,
          tauxTVA: 10
        }
      ],
      status: 'draft'
    };
    
    const createResponse = await axios.post(`${API_URL}/api/factures`, factureData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✓ Facture created successfully');
    console.log('Facture data:', JSON.stringify(createResponse.data, null, 2));
    
    // Verify calculations
    const facture = createResponse.data;
    const expectedHT = (2 * 100) + (3 * 50); // 200 + 150 = 350
    const expectedTVA = (200 * 0.20) + (150 * 0.10); // 40 + 15 = 55
    const expectedTTC = expectedHT + expectedTVA; // 350 + 55 = 405
    
    console.log('\n--- Calculation Verification ---');
    console.log(`Expected HT: ${expectedHT}, Actual: ${facture.montantHT}`);
    console.log(`Expected TVA: ${expectedTVA}, Actual: ${facture.montantTVA}`);
    console.log(`Expected TTC: ${expectedTTC}, Actual: ${facture.montantTTC}`);
    
    if (Math.abs(facture.montantHT - expectedHT) < 0.01 &&
        Math.abs(facture.montantTVA - expectedTVA) < 0.01 &&
        Math.abs(facture.montantTTC - expectedTTC) < 0.01) {
      console.log('✓ All calculations are correct!');
    } else {
      console.log('✗ Calculations mismatch!');
    }
    
    // Get all factures
    const listResponse = await axios.get(`${API_URL}/api/factures`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log(`\n✓ Total factures in database: ${listResponse.data.length}`);
    
  } catch (error) {
    console.error('✗ Test failed:', error.response?.data || error.message);
  }
}

testManualFacture();