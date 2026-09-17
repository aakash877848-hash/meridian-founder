const mongoose = require('mongoose');

// Internal notes are visible only to investor/admin roles (enforced in controller),
// never exposed to founders. Shared across the investor team so colleagues can
// collaborate on diligence, but each note tracks its author.
const noteSchema = new mongoose.Schema(
  {
    startup: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'StartupProfile',
      required: true,
      index: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 3000,
    },
    isPrivateToAuthor: {
      type: Boolean,
      default: false, // if true, only the author (and admins) can see it
    },
  },
  { timestamps: true }
);

noteSchema.index({ startup: 1, createdAt: -1 });

module.exports = mongoose.model('Note', noteSchema);
