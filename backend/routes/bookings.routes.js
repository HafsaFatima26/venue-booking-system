const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/bookings.controller');
const { verifyToken, requireRole } = require('../middleware/auth.middleware');

router.post('/', verifyToken, requireRole('customer'), ctrl.createBooking);
router.get('/customer', verifyToken, requireRole('customer'), ctrl.getCustomerBookings);
router.get('/owner', verifyToken, requireRole('owner'), ctrl.getOwnerBookings);
router.put('/:id/status', verifyToken, requireRole('owner'), ctrl.updateBookingStatus);
router.delete('/:id', verifyToken, ctrl.cancelBooking);

module.exports = router;
