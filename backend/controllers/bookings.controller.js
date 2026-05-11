const db = require('../config/db');

exports.createBooking = async (req, res) => {
    try {
        const { venue_id, event_date, guests, event_type, special_requests, total_amount, payment_card_last4, payment_card_name } = req.body;
        
        if (!venue_id || !event_date || !guests) {
            return res.status(400).json({ success: false, message: 'venue_id, event_date, and guests are required' });
        }
        
        const [result] = await db.query(
            'INSERT INTO bookings (venue_id, customer_id, event_date, guests, event_type, special_requests, total_amount, payment_card_last4, payment_card_name) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [venue_id, req.user.id, event_date, guests, event_type || 'Other', special_requests || '', total_amount, payment_card_last4, payment_card_name]
        );
        res.status(201).json({ success: true, data: { id: result.insertId, ...req.body, customer_id: req.user.id, status: 'pending', created_at: new Date() } });
    } catch (err) {
        console.error('createBooking error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getCustomerBookings = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT b.*, v.name as venue_name FROM bookings b JOIN venues v ON b.venue_id = v.id WHERE b.customer_id = ? ORDER BY b.created_at DESC', [req.user.id]);
        res.json({ success: true, data: rows });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.getOwnerBookings = async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT b.*, v.name as venue_name, c.full_name as customer_name, c.email as customer_email, c.phone as customer_phone FROM bookings b JOIN venues v ON b.venue_id = v.id JOIN customers c ON b.customer_id = c.id WHERE v.owner_id = ? ORDER BY b.created_at DESC',
            [req.user.id]
        );
        res.json({ success: true, data: rows });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.updateBookingStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const [result] = await db.query(
            'UPDATE bookings b JOIN venues v ON b.venue_id = v.id SET b.status = ? WHERE b.id = ? AND v.owner_id = ?',
            [status, req.params.id, req.user.id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Booking not found or not authorized' });
        }
        res.json({ success: true, message: 'Updated' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.cancelBooking = async (req, res) => {
    try {
        let query = 'DELETE FROM bookings WHERE id = ?';
        let params = [req.params.id];

        if (req.user.role === 'customer') {
            query += ' AND customer_id = ?';
            params.push(req.user.id);
        } else if (req.user.role === 'owner') {
            query += ' AND venue_id IN (SELECT id FROM venues WHERE owner_id = ?)';
            params.push(req.user.id);
        } else {
            return res.status(403).json({ success: false, message: 'Unauthorized role' });
        }

        const [result] = await db.query(query, params);
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Booking not found or not authorized' });
        }
        res.json({ success: true, message: 'Cancelled' });
    } catch (err) {
        console.error('cancelBooking error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};
