const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

// Configure Multer Storage for Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'ai_interview_coach_profiles',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
  },
});

// Configure Multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2 MB
  },
  fileFilter: (req, file, cb) => {
    // Check if the file is an image by mimetype
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Invalid image type'));
    }
  },
});

// Wrapper middleware to handle Multer errors gracefully
const uploadMiddleware = (req, res, next) => {
  const uploadSingle = upload.single('profilePicture');
  
  uploadSingle(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ success: false, message: 'File larger than 2 MB' });
      }
      return res.status(400).json({ success: false, message: err.message });
    } else if (err) {
      if (err.message === 'Invalid image type') {
        return res.status(400).json({ success: false, message: 'Invalid image type' });
      }
      return res.status(500).json({ success: false, message: 'Upload failure' });
    }
    
    next();
  });
};

module.exports = uploadMiddleware;
