const mongoose = require('mongoose');

const STAGES = [
  'New',
  'Screening',
  'Contacted',
  'In Discussion',
  'Due Diligence',
  'Term Sheet',
  'Invested',
  'Passed',
];

const pipelineSchema = new mongoose.Schema(
  {
    startup: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'StartupProfile',
      required: true,
      index: true,
    },
    // Owner is the investor/firm tracking this deal - allows multiple
    // investor teams to independently track the same startup.
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    stage: {
      type: String,
      enum: STAGES,
      default: 'New',
    },
    history: [
      {
        stage: { type: String, enum: STAGES },
        changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        changedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

pipelineSchema.index({ owner: 1, startup: 1 }, { unique: true });

pipelineSchema.methods.moveTo = function (newStage, userId) {
  this.stage = newStage;
  this.history.push({ stage: newStage, changedBy: userId, changedAt: new Date() });
};

module.exports = mongoose.model('Pipeline', pipelineSchema);
module.exports.STAGES = STAGES;
