const express = require('express');
const router = express.Router();
const {
  createOrUpdateKYC,
  updateKYCStatus,
  getKYCByUser,
  getKYCStatus,
  getAllKYCs,
  deleteKYC
} = require('../controllers/KYCController');

// Create/Update KYC
router.post('/:userId', createOrUpdateKYC);

// Update KYC status by userId
router.put('/:userId/status', updateKYCStatus);

// Get KYC by userId
router.get('/:userId', getKYCByUser);

// Get KYC status by userId
router.get('/:userId/status', getKYCStatus);

// Get all KYCs
router.get('/', getAllKYCs);

// Delete KYC by userId
router.delete('/:userId', deleteKYC);

module.exports = router;