const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const User = require('../models/User');
const Seller = require('../models/Seller');

/**
 * MESSAGE ROUTES
 * Handles messaging between users (customers) and sellers
 * - Conversations are identified by conversationId (sorted userId1_userId2)
 * - Messages support User and Seller models
 * - Real-time read status tracking
 */

// Helper function to generate conversation ID
const generateConversationId = (userId1, userId2) => {
  return [userId1, userId2].sort().join('_');
};

// Get all conversations for a user
router.get('/conversations/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Find all messages where user is sender or receiver
    const messages = await Message.find({
      $or: [
        { senderId: userId },
        { receiverId: userId }
      ]
    }).sort({ createdAt: -1 });

    // Group by conversation and get latest message
    const conversationsMap = new Map();
    
    for (const msg of messages) {
      const convId = msg.conversationId;
      
      if (!conversationsMap.has(convId)) {
        // Get the other user's ID
        const otherUserId = msg.senderId.toString() === userId ? msg.receiverId : msg.senderId;
        const otherUserModel = msg.senderId.toString() === userId ? msg.receiverModel : msg.senderModel;
        
        // Fetch other user's info
        let otherUser;
        if (otherUserModel === 'Seller') {
          otherUser = await Seller.findById(otherUserId).select('storeName fullName profileImage email');
        } else {
          // For User model, check User collection
          otherUser = await User.findById(otherUserId).select('fullName email profileImage');
        }

        // Count unread messages in this conversation
        const unreadCount = await Message.countDocuments({
          conversationId: convId,
          receiverId: userId,
          read: false
        });

        conversationsMap.set(convId, {
          conversationId: convId,
          otherUser: {
            _id: otherUserId,
            name: otherUser?.storeName || otherUser?.fullName || 'Customer',
            email: otherUser?.email || '',
            profileImage: otherUser?.profileImage || (otherUserModel === 'Seller' ? 'https://i.pravatar.cc/100' : ''),
            model: otherUserModel
          },
          lastMessage: {
            message: msg.message,
            createdAt: msg.createdAt,
            senderId: msg.senderId,
            read: msg.read
          },
          unreadCount,
          productId: msg.productId
        });
      }
    }

    const conversations = Array.from(conversationsMap.values());

    res.json({
      success: true,
      conversations
    });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch conversations',
      error: error.message
    });
  }
});

// Get unread message count for a user
router.get('/unread-count/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const unreadCount = await Message.countDocuments({
      receiverId: userId,
      read: false
    });

    res.json({
      success: true,
      unreadCount
    });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch unread count',
      error: error.message
    });
  }
});

// Get messages in a conversation
router.get('/conversation/:conversationId', async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { userId } = req.query;

    const messages = await Message.find({ conversationId })
      .populate('productId', 'name images price')
      .sort({ createdAt: 1 });

    // Populate sender info for each message
    for (let msg of messages) {
      if (msg.senderModel === 'Seller') {
        const seller = await Seller.findById(msg.senderId).select('storeName fullName profileImage');
        msg._doc.senderInfo = seller;
      } else {
        // For User model, check User collection
        const user = await User.findById(msg.senderId).select('fullName profileImage email');
        msg._doc.senderInfo = user;
      }
    }

    // Mark messages as read if userId is provided
    if (userId) {
      await Message.updateMany(
        {
          conversationId,
          receiverId: userId,
          read: false
        },
        {
          read: true,
          readAt: new Date()
        }
      );
    }

    res.json({
      success: true,
      messages
    });
  } catch (error) {
    console.error('Error fetching conversation messages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch messages',
      error: error.message
    });
  }
});

// Send a message
router.post('/', async (req, res) => {
  try {
    const { senderId, senderModel, receiverId, receiverModel, productId, message } = req.body;

    console.log('Received message request:', { senderId, senderModel, receiverId, receiverModel, productId, message });

    if (!senderId || !senderModel || !receiverId || !receiverModel || !message) {
      console.error('Missing required fields:', { senderId, senderModel, receiverId, receiverModel, message });
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
        missingFields: {
          senderId: !senderId,
          senderModel: !senderModel,
          receiverId: !receiverId,
          receiverModel: !receiverModel,
          message: !message
        }
      });
    }

    const conversationId = generateConversationId(senderId, receiverId);
    console.log('Generated conversationId:', conversationId);

    const newMessage = new Message({
      conversationId,
      senderId,
      senderModel,
      receiverId,
      receiverModel,
      productId,
      message
    });

    await newMessage.save();
    console.log('Message saved successfully:', newMessage._id);

    // Populate sender info
    let senderInfo;
    if (senderModel === 'Seller') {
      senderInfo = await Seller.findById(senderId).select('storeName fullName profileImage');
    } else {
      // For User model, check User collection
      senderInfo = await User.findById(senderId).select('fullName profileImage email');
    }

    newMessage._doc.senderInfo = senderInfo;

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: newMessage
    });
  } catch (error) {
    console.error('Error sending message:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Failed to send message',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Mark message as read
router.patch('/:messageId/read', async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findByIdAndUpdate(
      messageId,
      { read: true, readAt: new Date() },
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

// Delete a conversation
router.delete('/conversation/:conversationId/:userId', async (req, res) => {
  try {
    const { conversationId, userId } = req.params;

    await Message.deleteMany({
      conversationId,
      $or: [{ senderId: userId }, { receiverId: userId }]
    });

    res.json({
      success: true,
      message: 'Conversation deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting conversation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete conversation',
      error: error.message
    });
  }
});

module.exports = router;
