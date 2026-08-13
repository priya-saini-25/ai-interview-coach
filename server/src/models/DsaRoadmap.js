const mongoose = require('mongoose');

const dsaRoadmapProblemSchema = new mongoose.Schema(
  {
    problemId: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    topic: {
      type: String,
      required: true,
    },
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard'],
      default: 'Medium',
    },
    completed: {
      type: Boolean,
      default: false,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  { _id: false }
);

const dsaRoadmapDaySchema = new mongoose.Schema(
  {
    dayNumber: {
      type: Number,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    focusTopics: [
      {
        type: String,
      },
    ],
    learningGoals: [
      {
        type: String,
      },
    ],
    estimatedMinutes: {
      type: Number,
      default: 60,
    },
    revisionTasks: [
      {
        type: String,
      },
    ],
    problems: [dsaRoadmapProblemSchema],
  },
  { _id: false }
);

const dsaRoadmapSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      default: 'Personalized 7-Day DSA Preparation Roadmap',
    },
    goal: {
      type: String,
      default: 'Master weak topics and level up placement readiness',
    },
    targetRole: {
      type: String,
      default: 'Software Engineer',
    },
    generatedAt: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'expired'],
      default: 'active',
    },
    analyticsSnapshotHash: {
      type: String,
      required: true,
    },
    days: [dsaRoadmapDaySchema],
    totalProblems: {
      type: Number,
      default: 0,
    },
    completedProblems: {
      type: Number,
      default: 0,
    },
    completionPercentage: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('DsaRoadmap', dsaRoadmapSchema);
