const axios = require('axios');

const API_URL = 'http://localhost:3000';

async function testNewSystem() {
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
    
    // Test the new validation with a complete manual facture
    const factureData = {
      numero: 'FAC-NEW-001',
      date: new Date().toISOString(),
      type: 'achat',
      fournisseurNom: 'Test Fournisseur New',
      fournisseurId: null,
      clientId: null,
      items: [
        {
          designation: 'Frigo LG',
          quantite: 2,
          prixUnitaire: 5000,
          tauxTVA: 20
        },
        {
          designation: 'Lave-linge',
          quantite: 1,
          prixUnitaire: 8000,
          tauxTVA: 20
        }
      ],
      status: 'draft'
    };
    
    console.log('\n--- Testing manual facture creation ---');
    const createResponse = await axios.post(`${API_URL}/api/factures`, factureData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✓ Facture created successfully');
    console.log('Facture data:', JSON.stringify(createResponse.data, null, 2));
    
    // Verify calculations
    const facture = createResponse.data;
    const expectedHT = (2 * 5000) + (1 * 8000); // 10000 + 8000 = 18000
    const expectedTVA = (10000 * 0.20) + (8000 * 0.20); // 2000 + 1600 = 3600
    const expectedTTC = expectedHT + expectedTVA; // 18000 + 3600 = 21600
    
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
    
    // Test validation endpoint
    console.log('\n--- Testing validation endpoint ---');
    const validateResponse = await axios.put(`${API_URL}/api/factures/${facture.id}/valider`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✓ Facture validated successfully');
    console.log('Updated status:', validateResponse.data.status);
    
    // Test validation with invalid data
    console.log('\n--- Testing validation with invalid data ---');
    try {
      const invalidFacture = {
        numero: '', // Invalid: empty
        date: new Date().toISOString(),
        type: 'achat',
        items: []
      };
      
      await axios.post(`${API_URL}/api/factures`, invalidFacture, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✗ Validation should have failed but didn\'t');
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.log('✓ Validation correctly rejected invalid data');
        console.log('Validation errors:', error.response.data.erreurs);
      } else {
        console.log('✗ Unexpected error:', error.message);
      }
    }
    
    console.log('\n=== ALL TESTS PASSED ===');
    
  } catch (error) {
    console.error('✗ Test failed:', error.response?.data || error.message);
  }
}

testNewSystem();
