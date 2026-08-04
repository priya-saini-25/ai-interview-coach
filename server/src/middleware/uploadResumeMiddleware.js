const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

// Configure Multer Storage for Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'ai_interview_coach_resumes',
    allowed_formats: ['pdf'], // Allow PDF only
  },
});

// Configure Multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
  },
  fileFilter: (req, file, cb) => {
    // Check if the file is a PDF
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  },
});

// Wrapper middleware to handle Multer errors gracefully
const uploadResumeMiddleware = (req, res, next) => {
  const uploadSingle = upload.single('resume');
  
  uploadSingle(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ success: false, message: 'File larger than 5 MB' });
      }
      return res.status(400).json({ success: false, message: err.message });
    } else if (err) {
      if (err.message === 'Invalid file type') {
        return res.status(400).json({ success: false, message: 'Invalid file type' });
      }
      return res.status(500).json({ success: false, message: 'Upload failure' });
    }
    
    next();
  });
};

module.exports = uploadResumeMiddleware;
