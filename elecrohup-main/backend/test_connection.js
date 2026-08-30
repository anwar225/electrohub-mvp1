const axios = require('axios');

const API_URL = 'http://localhost:3000';

async function testConnection() {
  try {
    console.log('Test de connexion au backend...');
    
    // Test racine
    const rootResponse = await axios.get(API_URL);
    console.log('✓ Backend accessible:', rootResponse.data);
    
    // Test health
    const healthResponse = await axios.get(`${API_URL}/health`);
    console.log('✓ Health check:', healthResponse.data);
    
    // Test login
    console.log('\nTest de login...');
    const loginResponse = await axios.post(`${API_URL}/api/auth/login`, {
      email: 'test@example.com',
      password: 'password'
    });
    console.log('✓ Login réussi:', {
      user: loginResponse.data.user,
      token: loginResponse.data.token ? 'Token reçu' : 'Pas de token'
    });
    
  } catch (error) {
    console.error('✗ Erreur de connexion:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

testConnection();
