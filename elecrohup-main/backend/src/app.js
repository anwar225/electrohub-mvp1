const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const factureRoutes = require('./routes/factures');
const produitRoutes = require('./routes/produits');
const adminRoutes = require('./routes/admin');
const errorHandler = require('./middleware/errorHandler');

const app = express();

const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

app.use(cors({
  origin: [frontendUrl, 'http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
}));
app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    name: 'ElectroHub API MVP',
    status: 'ok',
    health: '/health',
    endpoints: {
      auth: '/api/auth',
      factures: '/api/factures',
      produits: '/api/produits',
      admin: '/api/admin',
    },
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/factures', factureRoutes);
app.use('/api/produits', produitRoutes);
app.use('/api/admin', adminRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

app.use(errorHandler);

module.exports = app;
