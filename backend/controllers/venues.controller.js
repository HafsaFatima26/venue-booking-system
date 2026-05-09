const db = require('../config/db');

exports.getAllVenues = async (req, res) => {
    try {
        const [venues] = await db.query('SELECT * FROM venues');
        const [amenities] = await db.query('SELECT venue_id, amenity FROM venue_amenities');
        
        const venuesWithAmenities = venues.map(v => {
            return {
                ...v,
                amenities: amenities.filter(a => a.venue_id === v.id).map(a => a.amenity)
            };
        });
        
        res.json({ success: true, data: venuesWithAmenities });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.getVenueById = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM venues WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ success: false, message: 'Not found' });
        
        const [amenities] = await db.query('SELECT amenity FROM venue_amenities WHERE venue_id = ?', [req.params.id]);
        
        res.json({ success: true, data: { ...rows[0], amenities: amenities.map(a => a.amenity) } });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.createVenue = async (req, res) => {
    try {
        const { name, location, capacity, price, venue_type, description, amenities } = req.body;
        const [result] = await db.query(
            'INSERT INTO venues (owner_id, name, location, capacity, price, venue_type, description) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [req.user.id, name, location, capacity, price, venue_type || 'Other', description || '']
        );
        const venueId = result.insertId;
        
        if (amenities && Array.isArray(amenities) && amenities.length > 0) {
            const values = amenities.map(a => [venueId, a]);
            await db.query('INSERT INTO venue_amenities (venue_id, amenity) VALUES ?', [values]);
        }
        
        res.status(201).json({ success: true, data: { id: venueId, ...req.body, owner_id: req.user.id } });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.updateVenue = async (req, res) => {
    try {
        const { name, location, capacity, price, venue_type, description } = req.body;
        await db.query(
            'UPDATE venues SET name=?, location=?, capacity=?, price=?, venue_type=?, description=? WHERE id=? AND owner_id=?',
            [name, location, capacity, price, venue_type, description, req.params.id, req.user.id]
        );
        res.json({ success: true, message: 'Updated' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.deleteVenue = async (req, res) => {
    try {
        await db.query('DELETE FROM venues WHERE id=? AND owner_id=?', [req.params.id, req.user.id]);
        res.json({ success: true, message: 'Deleted' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
