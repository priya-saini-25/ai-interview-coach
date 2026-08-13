const mongoose = require('mongoose');

const dsaRevisionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    problemId: {
      type: String,
      required: true,
    },
    topic: {
      type: String,
      default: '',
    },
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard'],
      default: 'Medium',
    },
    status: {
      type: String,
      enum: ['pending', 'due', 'completed', 'skipped'],
      default: 'pending',
    },
    revisionLevel: {
      type: Number,
      default: 0,
      min: 0,
      max: 4,
    },
    intervalDays: {
      type: Number,
      default: 1,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    lastReviewedAt: {
      type: Date,
      default: null,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    successCount: {
      type: Number,
      default: 0,
    },
    failureCount: {
      type: Number,
      default: 0,
    },
    lastResult: {
      type: String,
      enum: ['success', 'failure', 'skipped', null],
      default: null,
    },
    difficultyRating: {
      type: Number,
      min: 1,
      max: 5,
      default: 3,
    },
    priorityScore: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to prevent duplicate revision records per user per problem
dsaRevisionSchema.index({ user: 1, problemId: 1 }, { unique: true });

module.exports = mongoose.model('DsaRevision', dsaRevisionSchema);
