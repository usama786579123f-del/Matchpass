const Review = require('../models/Review');
const Order = require('../models/Order');
const { ApiError, success } = require('../utils/apiResponse');

/**
 * @route   POST /api/reviews
 * @desc    Leave a review after an order is settled. Works both ways:
 *          buyer reviews seller, OR seller reviews buyer — role is
 *          inferred from which side of the order req.user is on.
 * @access  Buyer or seller on a completed order
 */
const createReview = async (req, res, next) => {
  try {
    const { orderId, rating, comment } = req.body;

    const order = await Order.findById(orderId);
    if (!order) throw new ApiError(404, 'Order not found.');

    const settledStatuses = ['completed', 'delivered', 'partially_refunded'];
    if (!settledStatuses.includes(order.status)) {
      throw new ApiError(400, 'Reviews can only be left once an order has been delivered or completed.');
    }

    const isBuyer = order.buyer.toString() === req.user._id.toString();
    const isSeller = order.seller.toString() === req.user._id.toString();

    if (!isBuyer && !isSeller) {
      throw new ApiError(403, 'You were not a party to this order.');
    }

    const existing = await Review.findOne({
      order: order._id,
      reviewer: req.user._id,
    });
    if (existing) {
      throw new ApiError(409, 'You have already reviewed this order.');
    }

    const review = await Review.create({
      order: order._id,
      reviewer: req.user._id,
      reviewedUser: isBuyer ? order.seller : order.buyer,
      role: isBuyer ? 'buyer_reviews_seller' : 'seller_reviews_buyer',
      rating,
      comment,
    });

    return success(res, 201, 'Review submitted.', { review });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   GET /api/reviews/user/:userId
 * @desc    Public reviews for a user (shown on seller profile / listing page)
 */
const getReviewsForUser = async (req, res, next) => {
  try {
    const reviews = await Review.find({ reviewedUser: req.params.userId, isVisible: true })
      .populate('reviewer', 'name')
      .sort({ createdAt: -1 });

    const avgRating =
      reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : null;

    return success(res, 200, 'Reviews fetched.', {
      reviews,
      summary: {
        averageRating: avgRating ? Math.round(avgRating * 10) / 10 : null,
        totalReviews: reviews.length,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   PATCH /api/reviews/:id/hide
 * @desc    Admin hides an inappropriate/abusive review without deleting
 *          it outright (keeps a record, removes it from public view).
 * @access  Admin only
 */
const hideReview = async (req, res, next) => {
  try {
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { isVisible: false },
      { new: true }
    );
    if (!review) throw new ApiError(404, 'Review not found.');

    return success(res, 200, 'Review hidden.', { review });
  } catch (err) {
    next(err);
  }
};

module.exports = { createReview, getReviewsForUser, hideReview };