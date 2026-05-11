const jwt = require('jsonwebtoken');

// Verifies JWT and attaches decoded payload to req.user
const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // { id, role }
        next();
    } catch (err) {
        return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
    }
};

// Role guard — usage: requireRole('owner') or requireRole('customer')
const requireRole = (role) => (req, res, next) => {
    if (req.user?.role !== role) {
        return res.status(403).json({ success: false, message: `Access restricted to ${role}s only.` });
    }
    next();
};

module.exports = { verifyToken, requireRole };
