const mongoose = require('mongoose');

const roadmapSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    targetRole: {
      type: String,
      required: true,
    },
    targetCompany: {
      type: String,
      required: true,
    },
    currentYear: {
      type: String,
      required: true,
    },
    currentSkills: {
      type: [String],
      default: [],
    },
    targetPackage: {
      type: String,
      required: true,
    },
    roadmap: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Roadmap', roadmapSchema);
