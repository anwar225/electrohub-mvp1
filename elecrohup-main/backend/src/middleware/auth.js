const { verifyJwt } = require('../utils/jwt');
const prisma = require('../utils/prisma');

async function verifyToken(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = verifyJwt(token);
    const userId = Number(decoded.userId); // Ensure userId is a number
    
    req.userId = userId;
    req.userRole = decoded.role;
    
    // Get full user object
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
}

module.exports = { verifyToken };
