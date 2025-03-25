const express = require('express');
const router = express.Router();
const {
  createOrUpdateKYC,
  updateKYCStatusByEmail,
  getKYCByEmail,
  getKYCStatusByEmail,
  getAllKYCs,
  getKYCStats,
  deleteKYCByEmail
} = require('../controllers/KYCController');

// Create/Update KYC
router.post('/', createOrUpdateKYC);

// Update KYC status by email
router.put('/email/:email/status', updateKYCStatusByEmail);

// Get KYC by email
router.get('/email/:email', getKYCByEmail);

// Get KYC status by email
router.get('/email/:email/status', getKYCStatusByEmail);

// Get all KYCs
router.get('/', getAllKYCs);

// Get KYC statistics
router.get('/stats', getKYCStats);

// Delete KYC by email
router.delete('/email/:email', deleteKYCByEmail);

module.exports = router;