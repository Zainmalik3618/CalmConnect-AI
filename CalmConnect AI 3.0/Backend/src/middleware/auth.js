const jwt = require('jsonwebtoken');
const db = require('../services/db');

const auth = async (req, res, next) => {
  const authHeader = req.header('Authorization');
  if (!authHeader) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  const token = authHeader.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { rows } = await db.query(
        'SELECT id, username, email, role, status, age, emergency_contact, mental_health_goals, background_details, qualifications, specialization, registration_number, clinic_details, experience FROM users WHERE id = $1', 
        [decoded.userId]
    );
    
    if (rows.length === 0) {
      return res.status(401).json({ message: 'User not found' });
    }
    
    req.user = rows[0];
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

const adminAuth = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Admin access required.' });
    }
}

const psychiatristAuth = (req, res, next) => {
    if (req.user && req.user.role === 'psychiatrist') {
        next();
    } else {
        res.status(403).json({ message: 'Psychiatrist access required.' });
    }
}


module.exports = { auth, adminAuth, psychiatristAuth };
