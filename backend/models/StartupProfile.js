const mongoose = require('mongoose');

const SECTORS = [
  'Fintech', 'Healthtech', 'Edtech', 'SaaS', 'E-commerce', 'Marketplace',
  'AI/ML', 'Deeptech', 'Climate/Cleantech', 'Consumer', 'Logistics/Supply Chain',
  'Gaming', 'Media/Entertainment', 'Real Estate/Proptech', 'Agritech',
  'Web3/Crypto', 'Cybersecurity', 'HRtech', 'Legaltech', 'Other',
];

const STAGES = [
  'Idea', 'Pre-seed', 'Seed', 'Series A', 'Series B', 'Series C+', 'Growth', 'Bootstrapped',
];

const BUSINESS_MODELS = [
  'B2B', 'B2C', 'B2B2C', 'D2C', 'Marketplace', 'SaaS', 'Platform', 'Subscription', 'Other',
];

const VISIBILITY = ['private', 'investors_only', 'hidden'];

const teamMemberSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, required: true },
    role: { type: String, trim: true, required: true },
    linkedIn: { type: String, trim: true },
    bio: { type: String, trim: true, maxlength: 500 },
  },
  { _id: false }
);

const previousRoundSchema = new mongoose.Schema(
  {
    roundType: { type: String, trim: true },
    amount: { type: Number, min: 0 },
    currency: { type: String, default: 'USD' },
    date: Date,
    investors: [{ type: String, trim: true }],
  },
  { _id: false }
);

const documentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    type: {
      type: String,
      enum: ['pitch_deck', 'financials', 'cap_table', 'other'],
      default: 'other',
    },
    url: { type: String, required: true }, // served via /uploads/<filename> or external storage URL
    mimeType: String,
    sizeBytes: Number,
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const startupProfileSchema = new mongoose.Schema(
  {
    // Owning founder account (V1: one profile per founder user).
    founder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },

    // ---- Founder details (may differ slightly from account holder, e.g. co-founder) ----
    founderDetails: {
      fullName: { type: String, required: true, trim: true },
      email: { type: String, trim: true, lowercase: true },
      phone: { type: String, trim: true },
      linkedIn: { type: String, trim: true },
      bio: { type: String, trim: true, maxlength: 1000 },
      photoUrl: String,
    },

    // ---- Startup core details ----
    startupName: { type: String, required: true, trim: true, index: true },
    tagline: { type: String, trim: true, maxlength: 200 },
    description: { type: String, trim: true, maxlength: 4000 },
    logoUrl: String,
    foundedYear: { type: Number, min: 1900, max: new Date().getFullYear() + 1 },

    sector: { type: String, enum: SECTORS, required: true, index: true },
    subSector: { type: String, trim: true, index: true },

    stage: { type: String, enum: STAGES, required: true, index: true },

    location: {
      country: { type: String, trim: true, index: true },
      state: { type: String, trim: true },
      city: { type: String, trim: true, index: true },
    },

    businessModel: [{ type: String, enum: BUSINESS_MODELS }],

    // ---- Traction / revenue ----
    traction: {
      stageOfProduct: {
        type: String,
        enum: ['Concept', 'Prototype', 'MVP', 'Live/Launched', 'Scaling'],
      },
      monthlyRevenueUSD: { type: Number, min: 0, default: 0 },
      annualRevenueUSD: { type: Number, min: 0, default: 0 },
      growthRatePercentMoM: { type: Number },
      activeUsers: { type: Number, min: 0 },
      customers: { type: Number, min: 0 },
      notes: { type: String, maxlength: 2000 },
    },

    // ---- Fundraising ----
    fundraising: {
      isRaising: { type: Boolean, default: true },
      amountSeekingUSD: { type: Number, min: 0 },
      valuationUSD: { type: Number, min: 0 },
      roundType: { type: String, trim: true },
      useOfFunds: { type: String, maxlength: 1500 },
      previousRounds: [previousRoundSchema],
      totalRaisedUSD: { type: Number, min: 0, default: 0 },
    },

    // ---- Team ----
    team: [teamMemberSchema],
    teamSize: { type: Number, min: 1 },

    // ---- Links ----
    website: { type: String, trim: true },
    linkedInUrl: { type: String, trim: true },
    twitterUrl: { type: String, trim: true },

    // ---- Documents ----
    documents: [documentSchema],

    // ---- Visibility & workflow ----
    visibility: { type: String, enum: VISIBILITY, default: 'investors_only' },
    profileCompleteness: { type: Number, min: 0, max: 100, default: 0 },
    status: {
      type: String,
      enum: ['draft', 'submitted', 'verified'],
      default: 'draft',
      index: true,
    },

    // ---- Forward-looking / scalability hooks (V2+) ----
    verification: {
      isVerified: { type: Boolean, default: false },
      verifiedAt: Date,
      verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    },
    matchScores: [
      {
        investor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        score: Number,
        computedAt: Date,
      },
    ],
    tags: [{ type: String, trim: true, index: true }],
  },
  { timestamps: true }
);

// Compound + text indexes to support advanced search & filtering at scale.
startupProfileSchema.index({
  startupName: 'text',
  tagline: 'text',
  description: 'text',
  subSector: 'text',
  tags: 'text',
});
startupProfileSchema.index({ sector: 1, stage: 1, 'location.country': 1 });
startupProfileSchema.index({ 'fundraising.amountSeekingUSD': 1 });
startupProfileSchema.index({ 'traction.annualRevenueUSD': 1 });
startupProfileSchema.index({ createdAt: -1 });

// Basic profile-completeness calculator, run before save.
startupProfileSchema.pre('save', function (next) {
  const checks = [
    this.startupName,
    this.description,
    this.sector,
    this.stage,
    this.location && this.location.country,
    this.businessModel && this.businessModel.length,
    this.traction && (this.traction.monthlyRevenueUSD || this.traction.stageOfProduct),
    this.fundraising && this.fundraising.amountSeekingUSD,
    this.team && this.team.length,
    this.website,
    this.documents && this.documents.length,
  ];
  const filled = checks.filter(Boolean).length;
  this.profileCompleteness = Math.round((filled / checks.length) * 100);
  next();
});

module.exports = mongoose.model('StartupProfile', startupProfileSchema);
module.exports.SECTORS = SECTORS;
module.exports.STAGES = STAGES;
module.exports.BUSINESS_MODELS = BUSINESS_MODELS;
module.exports.VISIBILITY = VISIBILITY;
