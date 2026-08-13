const mongoose = require('mongoose');

const resumeAnalysisSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    resumeUrl: {
      type: String,
      required: true,
    },
    overallScore: {
      type: Number,
      default: 0,
    },
    strengths: [
      {
        type: String,
      },
    ],
    weaknesses: [
      {
        type: String,
      },
    ],
    missingSkills: [
      {
        type: String,
      },
    ],
    atsSuggestions: [
      {
        type: String,
      },
    ],
    improvementSuggestions: [
      {
        type: String,
      },
    ],
    rawText: {
      type: String,
      default: '',
    },
    contentHash: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('ResumeAnalysis', resumeAnalysisSchema);
