const express = require('express');
const router = express.Router();

const {
  getAllUsers,
  getUserByIdAdmin,
  toggleUserSuspension,
  updateSellerTier,
  getListingsForModeration,
  moderateListing,
  flagListing,
  getRevenueReport,
  getDisputesReport,
  getSellersReport,
} = require('../controllers/adminController');

const { protect } = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');

// All admin routes require authentication + admin role
router.use(protect, roleCheck('admin'));

// ---- User moderation ----
router.get('/users', getAllUsers);
router.get('/users/:id', getUserByIdAdmin);
router.patch('/users/:id/suspend', toggleUserSuspension);
router.patch('/users/:id/tier', updateSellerTier);

// ---- Listing moderation ----
router.get('/listings', getListingsForModeration);
router.patch('/listings/:id/moderate', moderateListing);
router.patch('/listings/:id/flag', flagListing);

// ---- Reports ----
router.get('/reports/revenue', getRevenueReport);
router.get('/reports/disputes', getDisputesReport);
router.get('/reports/sellers', getSellersReport);

module.exports = router;