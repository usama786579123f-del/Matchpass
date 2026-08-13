const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: 100,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 8,
      select: false,
    },
    role: {
      type: String,
      enum: ['buyer', 'seller', 'admin'],
      default: 'buyer',
    },
    phone: {
      type: String,
      trim: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: String,
    emailVerificationExpire: Date,
    passwordResetToken: String,
    passwordResetExpire: Date,

    // ---- KYC (required for sellers) ----
    kyc: {
      status: {
        type: String,
        enum: ['not_started', 'pending', 'verified', 'rejected'],
        default: 'not_started',
      },
      provider: {
        type: String,
        enum: ['stripe_identity', 'onfido', null],
        default: null,
      },
      providerReferenceId: String,
      idDocumentUrl: String,
      verifiedAt: Date,
      rejectionReason: String,
    },

    // ---- Stripe Connect (seller payouts) ----
    stripeConnect: {
      accountId: String,
      onboardingComplete: {
        type: Boolean,
        default: false,
      },
      payoutsEnabled: {
        type: Boolean,
        default: false,
      },
    },

    // ---- Stripe customer (buyer payments) ----
    stripeCustomerId: String,

    // ---- Seller trust tier ----
    sellerTier: {
      type: String,
      enum: ['new', 'standard', 'trusted', 'restricted', 'banned'],
      default: 'new',
    },
    validDisputeCount: {
      type: Number,
      default: 0,
    },

    // ---- Account status ----
    isActive: {
      type: Boolean,
      default: true,
    },
    isSuspended: {
      type: Boolean,
      default: false,
    },
    suspensionReason: String,

    // ---- Admin 2FA ----
    twoFactorEnabled: {
      type: Boolean,
      default: false,
    },
    twoFactorSecret: {
      type: String,
      select: false,
    },

    lastLoginAt: Date,
  },
  { timestamps: true }
);

userSchema.index({ role: 1 });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);