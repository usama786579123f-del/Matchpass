const express = require('express');
const router = express.Router();

const {
  requestDeletion,
  exportMyData,
  getDeletionRequests,
  processDeletion,
} = require('../controllers/gdprController');

const { protect } = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');

router.post('/request-deletion', protect, requestDeletion);
router.get('/request-export', protect, exportMyData);

router.get('/admin/deletion-requests', protect, roleCheck('admin'), getDeletionRequests);
router.post('/admin/process-deletion/:userId', protect, roleCheck('admin'), processDeletion);

module.exports = router;