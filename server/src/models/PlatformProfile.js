const mongoose = require('mongoose');

const platformProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    handles: {
      leetcode: { type: String, default: '', trim: true },
      codeforces: { type: String, default: '', trim: true },
      codechef: { type: String, default: '', trim: true },
      hackerrank: { type: String, default: '', trim: true },
    },
    stats: {
      leetcode: {
        totalSolved: { type: Number, default: 0 },
        easy: { type: Number, default: 0 },
        medium: { type: Number, default: 0 },
        hard: { type: Number, default: 0 },
      },
      codeforces: {
        rating: { type: Number, default: 0 },
        rank: { type: String, default: 'Unrated' },
        totalSolved: { type: Number, default: 0 },
        acceptedSubmissions: { type: Number, default: 0 },
      },
      codechef: {
        rating: { type: Number, default: 0 },
        stars: { type: String, default: '1★' },
        totalSolved: { type: Number, default: 0 },
      },
      hackerrank: {
        badgeStars: { type: Number, default: 0 },
        totalSolved: { type: Number, default: 0 },
      },
    },
    lastSyncedAt: {
      type: Date,
      default: null,
    },
    lastSyncStatus: {
      type: String,
      enum: ['Never Synced', 'Success', 'Partial Failure', 'Failed'],
      default: 'Never Synced',
    },
    lastSyncError: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('PlatformProfile', platformProfileSchema);
