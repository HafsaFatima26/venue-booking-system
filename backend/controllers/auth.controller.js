const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const db     = require('../config/db');

// ── Helper: sign JWT ──────────────────────────────────────────────────────────
const signToken = (id, role) =>
    jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

// ── Helper: safe user object (no password) ────────────────────────────────────
const safeCustomer = (u) => ({
    id:          u.id,
    username:    u.username,
    full_name:   u.full_name,
    email:       u.email,
    phone:       u.phone,
    has_card:    !!(u.card_number),
    card_last4:  u.card_number ? u.card_number.replace(/\s/g,'').slice(-4) : null,
    card_name:   u.card_name || null,
});

const safeOwner = (u) => ({
    id:            u.id,
    username:      u.username,
    full_name:     u.full_name,
    email:         u.email,
    phone:         u.phone,
    business_name: u.business_name,
    address:       u.address,
    description:   u.description,
});

// ══════════════════════════════════════════════════════════════════════════════
// CUSTOMER REGISTER
// POST /api/auth/customer/register
// Body: { username, password, full_name, email, phone }
// ══════════════════════════════════════════════════════════════════════════════
exports.customerRegister = async (req, res) => {
    try {
        const { username, password, full_name, email, phone } = req.body;

        if (!username || !password || !full_name || !email) {
            return res.status(400).json({ success: false, message: 'username, password, full_name and email are required.' });
        }

        // Check duplicate username / email
        const [existing] = await db.query(
            'SELECT id FROM customers WHERE username = ? OR email = ?',
            [username, email]
        );
        if (existing.length > 0) {
            return res.status(409).json({ success: false, message: 'Username or email already in use.' });
        }

        const hashed = await bcrypt.hash(password, 12);

        const [result] = await db.query(
            'INSERT INTO customers (username, password, full_name, email, phone) VALUES (?, ?, ?, ?, ?)',
            [username, hashed, full_name, email, phone || null]
        );

        const token = signToken(result.insertId, 'customer');

        return res.status(201).json({
            success: true,
            message: 'Customer registered successfully.',
            token,
            user: { id: result.insertId, username, full_name, email, phone, role: 'customer' },
        });
    } catch (err) {
        console.error('customerRegister error:', err);
        return res.status(500).json({ success: false, message: 'Server error.' });
    }
};

// ══════════════════════════════════════════════════════════════════════════════
// CUSTOMER LOGIN
// POST /api/auth/customer/login
// Body: { username, password }
// ══════════════════════════════════════════════════════════════════════════════
exports.customerLogin = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ success: false, message: 'Username and password are required.' });
        }

        const [rows] = await db.query('SELECT * FROM customers WHERE username = ?', [username]);
        if (rows.length === 0) {
            return res.status(401).json({ success: false, message: 'Invalid credentials.' });
        }

        const customer = rows[0];
        const isMatch  = await bcrypt.compare(password, customer.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials.' });
        }

        const token = signToken(customer.id, 'customer');

        return res.status(200).json({
            success: true,
            message: 'Login successful.',
            token,
            user: { ...safeCustomer(customer), role: 'customer' },
        });
    } catch (err) {
        console.error('customerLogin error:', err);
        return res.status(500).json({ success: false, message: 'Server error.' });
    }
};

// ══════════════════════════════════════════════════════════════════════════════
// OWNER REGISTER
// POST /api/auth/owner/register
// Body: { username, password, full_name, email, phone, business_name, address, description }
// ══════════════════════════════════════════════════════════════════════════════
exports.ownerRegister = async (req, res) => {
    try {
        const { username, password, full_name, email, phone, business_name, address, description } = req.body;

        if (!username || !password || !full_name || !email) {
            return res.status(400).json({ success: false, message: 'username, password, full_name and email are required.' });
        }

        const [existing] = await db.query(
            'SELECT id FROM owners WHERE username = ? OR email = ?',
            [username, email]
        );
        if (existing.length > 0) {
            return res.status(409).json({ success: false, message: 'Username or email already in use.' });
        }

        const hashed = await bcrypt.hash(password, 12);

        const [result] = await db.query(
            `INSERT INTO owners (username, password, full_name, email, phone, business_name, address, description)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [username, hashed, full_name, email, phone || null, business_name || null, address || null, description || null]
        );

        const token = signToken(result.insertId, 'owner');

        return res.status(201).json({
            success: true,
            message: 'Owner registered successfully.',
            token,
            user: { id: result.insertId, username, full_name, email, role: 'owner' },
        });
    } catch (err) {
        console.error('ownerRegister error:', err);
        return res.status(500).json({ success: false, message: 'Server error.' });
    }
};

// ══════════════════════════════════════════════════════════════════════════════
// OWNER LOGIN
// POST /api/auth/owner/login
// Body: { username, password }
// ══════════════════════════════════════════════════════════════════════════════
exports.ownerLogin = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ success: false, message: 'Username and password are required.' });
        }

        const [rows] = await db.query('SELECT * FROM owners WHERE username = ?', [username]);
        if (rows.length === 0) {
            return res.status(401).json({ success: false, message: 'Invalid credentials.' });
        }

        const owner   = rows[0];
        const isMatch = await bcrypt.compare(password, owner.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials.' });
        }

        const token = signToken(owner.id, 'owner');

        return res.status(200).json({
            success: true,
            message: 'Login successful.',
            token,
            user: { ...safeOwner(owner), role: 'owner' },
        });
    } catch (err) {
        console.error('ownerLogin error:', err);
        return res.status(500).json({ success: false, message: 'Server error.' });
    }
};

// ══════════════════════════════════════════════════════════════════════════════
// SAVE / UPDATE CARD  (Customer only — protected route)
// PUT /api/auth/customer/card
// Body: { card_number, card_expiry, card_cvv, card_name }
// ══════════════════════════════════════════════════════════════════════════════
exports.saveCard = async (req, res) => {
    try {
        const { card_number, card_expiry, card_cvv, card_name } = req.body;

        if (!card_number || !card_expiry || !card_cvv || !card_name) {
            return res.status(400).json({ success: false, message: 'All card fields are required.' });
        }

        // Basic length validations
        const digits = card_number.replace(/\s/g, '');
        if (digits.length !== 16) {
            return res.status(400).json({ success: false, message: 'Card number must be 16 digits.' });
        }
        if (card_cvv.length < 3 || card_cvv.length > 4) {
            return res.status(400).json({ success: false, message: 'CVV must be 3 or 4 digits.' });
        }

        await db.query(
            'UPDATE customers SET card_number=?, card_expiry=?, card_cvv=?, card_name=? WHERE id=?',
            [card_number, card_expiry, card_cvv, card_name, req.user.id]
        );

        return res.status(200).json({ success: true, message: 'Card saved successfully.' });
    } catch (err) {
        console.error('saveCard error:', err);
        return res.status(500).json({ success: false, message: 'Server error.' });
    }
};

// ══════════════════════════════════════════════════════════════════════════════
// GET CURRENT USER PROFILE  (protected — works for both roles)
// GET /api/auth/me
// Header: Authorization: Bearer <token>
// ══════════════════════════════════════════════════════════════════════════════
exports.getMe = async (req, res) => {
    try {
        const { id, role } = req.user;

        if (role === 'customer') {
            const [rows] = await db.query('SELECT * FROM customers WHERE id = ?', [id]);
            if (!rows.length) return res.status(404).json({ success: false, message: 'User not found.' });
            return res.json({ success: true, user: { ...safeCustomer(rows[0]), role } });
        }

        if (role === 'owner') {
            const [rows] = await db.query('SELECT * FROM owners WHERE id = ?', [id]);
            if (!rows.length) return res.status(404).json({ success: false, message: 'User not found.' });
            return res.json({ success: true, user: { ...safeOwner(rows[0]), role } });
        }

        return res.status(400).json({ success: false, message: 'Invalid role in token.' });
    } catch (err) {
        console.error('getMe error:', err);
        return res.status(500).json({ success: false, message: 'Server error.' });
    }
};
