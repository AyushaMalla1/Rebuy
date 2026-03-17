const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const User = require('../models/User');
const Seller = require('../models/Seller');

// Send message to seller
router.post('/', async (req, res) => {
  try {
    const { senderId, senderModel, receiverId, productId, subject, message } = req.body;

    const newMessage = new Message({
      senderId,
      senderModel,
      receiverId,
      productId,
      subject,
      message
    });

    await newMessage.save();

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: newMessage
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message',
      error: error.message
    });
  }
});

// Get messages for a seller (inbox)
router.get('/seller/:sellerId', async (req, res) => {
  try {
    const { sellerId } = req.params;

    const messages = await Message.find({ receiverId: sellerId })
      .populate('productId', 'name images')
      .sort({ createdAt: -1 });

    // Populate sender info based on senderModel
    for (let msg of messages) {
      if (msg.senderModel === 'User') {
        const user = await User.findById(msg.senderId).select('fullName email');
        msg._doc.senderInfo = user;
      } else if (msg.senderModel === 'Seller') {
        const seller = await Seller.findById(msg.senderId).select('fullName storeName email');
        msg._doc.senderInfo = seller;
      }
    }

    const unreadCount = messages.filter(m => !m.read).length;

    res.json({
      success: true,
      messages,
      unreadCount
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch messages',
      error: error.message
    });
  }
});

// Mark message as read
router.patch('/:messageId/read', async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findByIdAndUpdate(
      messageId,
      { read: true },
      { new: true }
    );

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    res.json({
      success: true,
      message: 'Message marked as read',
      data: message
    });
  } catch (error) {
    console.error('Error marking message as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark message as read',
      error: error.message
    });
  }
});

// Delete message
router.delete('/:messageId', async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findByIdAndDelete(messageId);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    res.json({
      success: true,
      message: 'Message deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete message',
      error: error.message
    });
  }
});

module.exports = router;
