const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/venues.controller');
const { verifyToken, requireRole } = require('../middleware/auth.middleware');

router.get('/', ctrl.getAllVenues);
router.get('/:id', ctrl.getVenueById);
router.post('/', verifyToken, requireRole('owner'), ctrl.createVenue);
router.put('/:id', verifyToken, requireRole('owner'), ctrl.updateVenue);
router.delete('/:id', verifyToken, requireRole('owner'), ctrl.deleteVenue);

module.exports = router;
