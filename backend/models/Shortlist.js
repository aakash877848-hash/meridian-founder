const mongoose = require('mongoose');

const shortlistSchema = new mongoose.Schema(
  {
    investor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    startup: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'StartupProfile',
      required: true,
      index: true,
    },
    listName: {
      type: String,
      default: 'Default',
      trim: true, // supports future multiple named watchlists
    },
  },
  { timestamps: true }
);

shortlistSchema.index({ investor: 1, startup: 1, listName: 1 }, { unique: true });

module.exports = mongoose.model('Shortlist', shortlistSchema);
