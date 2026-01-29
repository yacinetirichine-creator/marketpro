// ============================================
// MARKET PRO API - Routes Achats
// ============================================

const express = require('express');
const router = express.Router();
const { authenticate, hasPermission } = require('../middleware/auth');

router.use(authenticate);

// Placeholder pour les routes d'achats
router.get('/', hasPermission('VIEW_PURCHASES'), async (req, res) => {
  res.json({ success: true, data: { purchases: [], pagination: { page: 1, total: 0 } } });
});

router.get('/stats', hasPermission('VIEW_PURCHASES'), async (req, res) => {
  res.json({ success: true, data: { totalPurchases: 0, pendingOrders: 0, monthlySpend: 0 } });
});

module.exports = router;
