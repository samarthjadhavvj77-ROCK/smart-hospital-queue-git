const Notification = require('../models/Notification.js');

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
const getNotifications = async (req, res) => {
  const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(50);
  res.json(notifications);
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
const markAsRead = async (req, res) => {
  const notification = await Notification.findById(req.params.id);
  if (notification && notification.user.toString() === req.user._id.toString()) {
    notification.isRead = true;
    await notification.save();
    res.json({ message: 'Notification marked as read' });
  } else {
    res.status(404).json({ message: 'Notification not found' });
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/readall
// @access  Private
const markAllAsRead = async (req, res) => {
  await Notification.updateMany({ user: req.user._id, isRead: false }, { isRead: true });
  res.json({ message: 'All notifications marked as read' });
};

module.exports = { getNotifications, markAsRead, markAllAsRead };
