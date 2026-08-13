const mongoose = require('mongoose');

const interviewSessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    role: {
      type: String,
      required: [true, 'Please provide a role'],
      trim: true,
    },
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard'],
      default: 'Medium',
    },
    company: {
      type: String,
      default: '',
      trim: true,
    },
    questions: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
    answers: {
      type: [String],
      default: [],
    },
    feedback: {
      type: [String],
      default: [],
    },
    score: {
      type: Number,
      default: 0,
    },
    sectionScores: {
      technical: { type: Number, default: 0 },
      logical: { type: Number, default: 0 },
      personal: { type: Number, default: 0 },
      hr: { type: Number, default: 0 },
    },
    detailedAnalysis: {
      strengths: { type: [String], default: [] },
      weaknesses: { type: [String], default: [] },
      recommendations: { type: [String], default: [] },
      questionsToImprove: { type: [String], default: [] },
      overallReadiness: { type: String, default: '' },
    },
    completed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('InterviewSession', interviewSessionSchema);
