// ============================================
// MARKET PRO API - Routes Audit
// ============================================

const express = require('express');
const router = express.Router();
const AuditLog = require('../models/AuditLog');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);
router.use(authorize('ADMIN', 'MANAGER'));

// GET /api/audit - Liste des logs
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 50, 
      eventType, 
      user, 
      severity,
      resource,
      startDate, 
      endDate 
    } = req.query;
    
    const query = {};
    if (eventType) query.eventType = eventType;
    if (user) query.user = user;
    if (severity) query.severity = severity;
    if (resource) query.resource = resource;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }
    
    const logs = await AuditLog.find(query)
      .populate('user', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    
    const total = await AuditLog.countDocuments(query);
    
    res.json({
      success: true,
      data: {
        logs,
        pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) }
      }
    });
    
  } catch (error) {
    console.error('Get audit logs error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

// GET /api/audit/stats
router.get('/stats', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const eventStats = await AuditLog.aggregate([
      { $match: { createdAt: { $gte: weekAgo } } },
      { $group: { _id: '$eventType', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    const severityStats = await AuditLog.aggregate([
      { $match: { createdAt: { $gte: weekAgo } } },
      { $group: { _id: '$severity', count: { $sum: 1 } } }
    ]);
    
    const dailyActivity = await AuditLog.aggregate([
      { $match: { createdAt: { $gte: weekAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    const securityEvents = await AuditLog.countDocuments({
      createdAt: { $gte: weekAgo },
      eventType: { $regex: /^SECURITY_/ }
    });
    
    res.json({
      success: true,
      data: {
        eventStats,
        severityStats,
        dailyActivity,
        securityEvents
      }
    });
    
  } catch (error) {
    console.error('Get audit stats error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

// GET /api/audit/security
router.get('/security', authorize('ADMIN'), async (req, res) => {
  try {
    const { days = 7 } = req.query;
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    
    const securityEvents = await AuditLog.find({
      eventType: { $regex: /^SECURITY_|AUTH_LOGIN_FAILED/ },
      createdAt: { $gte: startDate }
    })
      .populate('user', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .limit(100);
    
    const suspiciousIPs = await AuditLog.aggregate([
      {
        $match: {
          eventType: 'AUTH_LOGIN_FAILED',
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$request.ip',
          attempts: { $sum: 1 },
          lastAttempt: { $max: '$createdAt' }
        }
      },
      { $match: { attempts: { $gte: 3 } } },
      { $sort: { attempts: -1 } }
    ]);
    
    res.json({
      success: true,
      data: {
        securityEvents,
        suspiciousIPs
      }
    });
    
  } catch (error) {
    console.error('Get security audit error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

// GET /api/audit/user/:userId
router.get('/user/:userId', async (req, res) => {
  try {
    const logs = await AuditLog.getByUser(req.params.userId);
    
    res.json({
      success: true,
      data: { logs }
    });
    
  } catch (error) {
    console.error('Get user audit error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

// GET /api/audit/resource/:resource/:resourceId
router.get('/resource/:resource/:resourceId', async (req, res) => {
  try {
    const logs = await AuditLog.getByResource(req.params.resource, req.params.resourceId);
    
    res.json({
      success: true,
      data: { logs }
    });
    
  } catch (error) {
    console.error('Get resource audit error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

module.exports = router;
