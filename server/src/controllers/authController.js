const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password',
      });
    }

    // Check if user with this email already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email',
      });
    }

    // Hash password using bcryptjs with 10 salt rounds
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user record in MongoDB
    await User.create({
      name,
      email,
      password: hashedPassword,
    });

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get JWT token
// @route   POST /api/auth/login
// @access  Public
exports.loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // 1. Validate email and password presence
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    // 2. Check if user exists
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // 3. Compare password with hashed password in database
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // 4. Generate JWT payload & sign token
    const payload = {
      userId: user._id,
      email: user.email,
      role: user.role,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE || '30d',
    });

    // 5. Return success response with token and user object
    return res.status(200).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        college: user.college || '',
        branch: user.branch || '',
        graduationYear: user.graduationYear || '',
        targetRole: user.targetRole || '',
        targetCompany: user.targetCompany || '',
        profilePicture: user.profilePicture,
        resume: user.resume,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
exports.getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    return res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        college: user.college || '',
        branch: user.branch || '',
        graduationYear: user.graduationYear || '',
        targetRole: user.targetRole || '',
        targetCompany: user.targetCompany || '',
        profilePicture: user.profilePicture,
        resume: user.resume,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      }
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateUserProfile = async (req, res, next) => {
  try {
    const { name, college, branch, graduationYear, targetRole, targetCompany } = req.body;
    
    // Check if neither file nor profile details are provided
    if (
      !req.file &&
      name === undefined &&
      college === undefined &&
      branch === undefined &&
      graduationYear === undefined &&
      targetRole === undefined &&
      targetCompany === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: 'Please provide profile details or a profile picture to update',
      });
    }

    // Validate that name is not empty if it's provided in the body
    if (name !== undefined && name.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Name cannot be empty',
      });
    }

    // Fetch the user first to get the old profile picture public ID
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const updateFields = {};
    if (name !== undefined) updateFields.name = name.trim();
    if (college !== undefined) updateFields.college = college.trim();
    if (branch !== undefined) updateFields.branch = branch.trim();
    if (graduationYear !== undefined) updateFields.graduationYear = graduationYear.trim();
    if (targetRole !== undefined) updateFields.targetRole = targetRole.trim();
    if (targetCompany !== undefined) updateFields.targetCompany = targetCompany.trim();

    // Handle new profile picture
    if (req.file) {
      updateFields.profilePicture = req.file.path; // Cloudinary secure_url
      updateFields.profilePicturePublicId = req.file.filename; // Cloudinary public_id

      // Delete old profile picture from Cloudinary
      if (user.profilePicturePublicId) {
        const cloudinary = require('../config/cloudinary');
        try {
          await cloudinary.uploader.destroy(user.profilePicturePublicId);
        } catch (cloudinaryError) {
          console.error('Error deleting old profile picture:', cloudinaryError);
        }
      }
    }

    // Update the user document
    const updatedUser = await User.findByIdAndUpdate(
      req.user.userId,
      { $set: updateFields },
      { new: true, runValidators: true }
    ).select('-password -profilePicturePublicId');

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        college: updatedUser.college || '',
        branch: updatedUser.branch || '',
        graduationYear: updatedUser.graduationYear || '',
        targetRole: updatedUser.targetRole || '',
        targetCompany: updatedUser.targetCompany || '',
        profilePicture: updatedUser.profilePicture,
        resume: updatedUser.resume,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt,
      },
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update profile',
    });
  }
};

// @desc    Upload user resume
// @route   PUT /api/auth/resume
// @access  Private
exports.uploadResume = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded',
      });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const cloudinary = require('../config/cloudinary');

    // Delete old resume from Cloudinary if it exists
    if (user.resumePublicId) {
      try {
        await cloudinary.uploader.destroy(user.resumePublicId, { resource_type: 'raw' });
      } catch (cloudinaryError) {
        console.error('Error deleting old resume:', cloudinaryError);
      }
    }

    // Stream buffer to Cloudinary using upload_stream
    const stream = require('stream');
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'ai_interview_coach_resumes',
          resource_type: 'raw',
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );
      stream.Readable.from(req.file.buffer).pipe(uploadStream);
    });

    // Update user with new resume URL and public_id
    const updatedUser = await User.findByIdAndUpdate(
      req.user.userId,
      {
        $set: {
          resume: result.secure_url,
          resumePublicId: result.public_id,
        },
      },
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      message: 'Resume uploaded successfully',
      resume: updatedUser.resume,
    });
  } catch (error) {
    console.error('Error uploading resume:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};


