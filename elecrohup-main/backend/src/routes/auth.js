const express = require('express');
const bcrypt = require('bcrypt');
const prisma = require('../utils/prisma');
const { signToken } = require('../utils/jwt');
const { isEmail, requireFields } = require('../utils/validators');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

router.post('/signup', async (req, res, next) => {
  try {
    const { email, password, nom, role } = req.body;
    const missing = requireFields(req.body, ['email', 'password', 'nom']);
    if (missing.length) {
      return res.status(400).json({ error: 'Missing fields', missing });
    }
    if (!isEmail(email)) {
      return res.status(400).json({ error: 'Invalid email' });
    }
    if (String(password).length < 6) {
      return res.status(400).json({ error: 'Password too short' });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        nom,
        role: role === 'admin' ? 'admin' : 'vendeur',
      },
    });

    const token = signToken({ userId: user.id, email: user.email, role: user.role });
    res.status(201).json({
      token,
      user: { id: user.id, email: user.email, nom: user.nom, role: user.role },
    });
  } catch (error) {
    next(error);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Missing email/password' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = signToken({ userId: user.id, email: user.email, role: user.role });
    res.json({
      token,
      user: { id: user.id, email: user.email, nom: user.nom, role: user.role },
    });
  } catch (error) {
    next(error);
  }
});

router.get('/me', verifyToken, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { id: true, email: true, nom: true, role: true, createdAt: true },
    });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
