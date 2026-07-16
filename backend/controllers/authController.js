const User = require('../models/User.js');
const Hospital = require('../models/Hospital.js');
const generateToken = require('../utils/generateToken.js');

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const authUser = async (req, res) => {
  const { email, password } = req.body;

  let user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    // Subscription Check for Admins
    if (user.role === 'admin') {
      const now = new Date();
      let statusChanged = false;
      
      // If currently active, check if subscription expired
      if (user.subscriptionStatus === 'active' && user.subscriptionExpiresAt && now > user.subscriptionExpiresAt) {
        user.subscriptionStatus = 'expired';
        statusChanged = true;
      }
      
      // If currently on trial, check if trial expired
      if (user.subscriptionStatus === 'trial' && user.trialExpiresAt && now > user.trialExpiresAt) {
        user.subscriptionStatus = 'expired';
        statusChanged = true;
      }

      if (statusChanged) {
        await user.save();
      }
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      subscriptionStatus: user.subscriptionStatus,
      trialExpiresAt: user.trialExpiresAt,
      subscriptionExpiresAt: user.subscriptionExpiresAt,
      token: generateToken(user._id),
    });
  } else {
    res.status(401).json({ message: 'Invalid email or password' });
  }
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { name, email, phone, password, role, hospitalName, hospitalAddress } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
      res.status(400).json({ message: 'User already exists' });
      return;
    }

    const userRole = role === 'admin' ? 'admin' : 'patient';
    
    // Subscription logic for hospital admins
    let subscriptionData = {};
    if (userRole === 'admin') {
      subscriptionData = {
        subscriptionStatus: 'trial',
        trialExpiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
      };
      
      if (!hospitalName) {
        return res.status(400).json({ message: 'Hospital Name is required for admin registration' });
      }
    } else {
      subscriptionData = {
        subscriptionStatus: 'active', // Patients don't pay, always active
      };
    }

    const user = await User.create({
      name,
      email,
      phone,
      password,
      role: userRole,
      ...subscriptionData
    });

    if (user) {
      let hospitalId = null;
      if (userRole === 'admin') {
        const hospital = await Hospital.create({
          name: hospitalName,
          admin: user._id,
          email: user.email,
          phone: user.phone,
          address: hospitalAddress || '',
        });
        hospitalId = hospital._id;
      }

      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        hospitalId: hospitalId,
        subscriptionStatus: user.subscriptionStatus,
        trialExpiresAt: user.trialExpiresAt,
        subscriptionExpiresAt: user.subscriptionExpiresAt,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      subscriptionStatus: user.subscriptionStatus,
      trialExpiresAt: user.trialExpiresAt,
      subscriptionExpiresAt: user.subscriptionExpiresAt,
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

// @desc    Subscribe / Pay Monthly Fee (Admin Only)
// @route   POST /api/auth/subscribe
// @access  Private
const subscribeAdmin = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized for subscription' });
    }

    // Add 30 days to existing subscription, or from today if expired
    let newExpiry = new Date();
    if (user.subscriptionStatus === 'active' && user.subscriptionExpiresAt && user.subscriptionExpiresAt > newExpiry) {
      newExpiry = new Date(user.subscriptionExpiresAt);
    }
    
    // Add 30 days (1 month)
    newExpiry.setDate(newExpiry.getDate() + 30);

    user.subscriptionStatus = 'active';
    user.subscriptionExpiresAt = newExpiry;
    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      subscriptionStatus: user.subscriptionStatus,
      trialExpiresAt: user.trialExpiresAt,
      subscriptionExpiresAt: user.subscriptionExpiresAt,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { authUser, registerUser, getUserProfile, subscribeAdmin };
