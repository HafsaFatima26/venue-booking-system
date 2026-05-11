const express  = require('express');
const router   = express.Router();
const ctrl     = require('../controllers/auth.controller');
const { verifyToken, requireRole } = require('../middleware/auth.middleware');

// ── Customer ──────────────────────────────────────────────────────────────────
router.post('/customer/register', ctrl.customerRegister);
router.post('/customer/login',    ctrl.customerLogin);
router.put(
    '/customer/card',
    verifyToken,
    requireRole('customer'),
    ctrl.saveCard
);

// ── Owner ─────────────────────────────────────────────────────────────────────
router.post('/owner/register', ctrl.ownerRegister);
router.post('/owner/login',    ctrl.ownerLogin);
router.put(
    '/owner/profile',
    verifyToken,
    requireRole('owner'),
    ctrl.updateOwnerProfile
);

// ── Shared (both roles) ───────────────────────────────────────────────────────
router.get('/me', verifyToken, ctrl.getMe);

module.exports = router;
