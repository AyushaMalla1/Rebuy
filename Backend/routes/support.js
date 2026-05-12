const express = require('express');
const router = express.Router();
const SupportTicket = require('../models/SupportTicket');
const SupportMessage = require('../models/SupportMessage');
const User = require('../models/User');
const Seller = require('../models/Seller');
const Admin = require('../models/Admin');
const Notification = require('../models/Notification');
const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configure Cloudinary storage for attachments
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'support_attachments',
    allowed_formats: ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx'],
    resource_type: 'auto'
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Create a new support ticket
router.post('/tickets', upload.array('attachments', 5), async (req, res) => {
  try {
    const { subject, category, priority, message, userType, userId, relatedOrder, relatedProduct } = req.body;

    // Get user details
    let user;
    let userModel;
    if (userType === 'customer') {
      user = await User.findById(userId);
      userModel = 'User';
    } else if (userType === 'seller') {
      user = await Seller.findById(userId);
      userModel = 'Seller';
    }

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Process attachments
    const attachments = req.files ? req.files.map(file => ({
      filename: file.originalname,
      url: file.path
    })) : [];

    // Create ticket
    const ticket = new SupportTicket({
      subject,
      category,
      priority: priority || 'medium',
      createdBy: {
        userId: user._id,
        userType: userModel,
        name: user.fullName || user.storeName,
        email: user.email
      },
      attachments,
      relatedOrder,
      relatedProduct,
      lastReplyBy: 'user'
    });

    await ticket.save();

    // Create initial message
    const supportMessage = new SupportMessage({
      ticket: ticket._id,
      sender: {
        userId: user._id,
        userType: userModel,
        name: user.fullName || user.storeName,
        email: user.email
      },
      message,
      attachments
    });

    await supportMessage.save();

    // Notify all admins
    const admins = await Admin.find({ isActive: true });
    for (const admin of admins) {
      await Notification.create({
        user: admin._id,
        userType: 'admin',
        type: 'support',
        title: 'New Support Ticket',
        message: `New ticket #${ticket.ticketNumber}: ${subject}`,
        link: `/admin/support/${ticket._id}`
      });
    }

    res.status(201).json({
      message: 'Support ticket created successfully',
      ticket,
      ticketNumber: ticket.ticketNumber
    });
  } catch (error) {
    console.error('Error creating support ticket:', error);
    res.status(500).json({ message: 'Failed to create support ticket', error: error.message });
  }
});

// Get user's tickets (customer or seller)
router.get('/tickets/my/:userId/:userType', async (req, res) => {
  try {
    const { userId, userType } = req.params;
    const { status, category, search } = req.query;

    const query = {
      'createdBy.userId': userId,
      'createdBy.userType': userType === 'customer' ? 'User' : 'Seller'
    };

    if (status) query.status = status;
    if (category) query.category = category;
    if (search) {
      query.$or = [
        { subject: { $regex: search, $options: 'i' } },
        { ticketNumber: { $regex: search, $options: 'i' } }
      ];
    }

    const tickets = await SupportTicket.find(query)
      .sort({ lastReplyAt: -1 })
      .populate('assignedTo', 'fullName email');

    res.json(tickets);
  } catch (error) {
    console.error('Error fetching tickets:', error);
    res.status(500).json({ message: 'Failed to fetch tickets', error: error.message });
  }
});

// Get single ticket details
router.get('/tickets/:ticketId', async (req, res) => {
  try {
    const ticket = await SupportTicket.findById(req.params.ticketId)
      .populate('assignedTo', 'fullName email')
      .populate('relatedOrder')
      .populate('relatedProduct', 'name image');

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    // Get all messages for this ticket
    const messages = await SupportMessage.find({ ticket: ticket._id })
      .sort({ createdAt: 1 });

    res.json({ ticket, messages });
  } catch (error) {
    console.error('Error fetching ticket:', error);
    res.status(500).json({ message: 'Failed to fetch ticket', error: error.message });
  }
});

// Reply to a ticket
router.post('/tickets/:ticketId/reply', upload.array('attachments', 5), async (req, res) => {
  try {
    const { message, userId, userType } = req.body;
    const ticket = await SupportTicket.findById(req.params.ticketId);

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    // Get user details
    let user;
    let userModel;
    if (userType === 'admin') {
      user = await Admin.findById(userId);
      userModel = 'Admin';
    } else if (userType === 'customer') {
      user = await User.findById(userId);
      userModel = 'User';
    } else if (userType === 'seller') {
      user = await Seller.findById(userId);
      userModel = 'Seller';
    }

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Process attachments
    const attachments = req.files ? req.files.map(file => ({
      filename: file.originalname,
      url: file.path
    })) : [];

    // Create message
    const supportMessage = new SupportMessage({
      ticket: ticket._id,
      sender: {
        userId: user._id,
        userType: userModel,
        name: user.fullName || user.storeName,
        email: user.email
      },
      message,
      attachments
    });

    await supportMessage.save();

    // Update ticket
    ticket.lastReplyAt = new Date();
    ticket.lastReplyBy = userType === 'admin' ? 'admin' : 'user';
    
    if (userType === 'admin') {
      ticket.unreadByUser = true;
      ticket.unreadByAdmin = false;
      if (ticket.status === 'open') {
        ticket.status = 'pending';
      }
    } else {
      ticket.unreadByAdmin = true;
      ticket.unreadByUser = false;
    }

    await ticket.save();

    // Send notification
    if (userType === 'admin') {
      // Notify the ticket creator
      await Notification.create({
        user: ticket.createdBy.userId,
        userType: ticket.createdBy.userType.toLowerCase(),
        type: 'support',
        title: 'Support Ticket Reply',
        message: `Admin replied to your ticket #${ticket.ticketNumber}`,
        link: `/support/tickets/${ticket._id}`
      });
    } else {
      // Notify admins
      const admins = await Admin.find({ isActive: true });
      for (const admin of admins) {
        await Notification.create({
          user: admin._id,
          userType: 'admin',
          type: 'support',
          title: 'Support Ticket Update',
          message: `New reply on ticket #${ticket.ticketNumber}`,
          link: `/admin/support/${ticket._id}`
        });
      }
    }

    res.json({ message: 'Reply sent successfully', supportMessage });
  } catch (error) {
    console.error('Error sending reply:', error);
    res.status(500).json({ message: 'Failed to send reply', error: error.message });
  }
});

// Mark ticket as read
router.patch('/tickets/:ticketId/read', async (req, res) => {
  try {
    const { userType } = req.body;
    const ticket = await SupportTicket.findById(req.params.ticketId);

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    if (userType === 'admin') {
      ticket.unreadByAdmin = false;
    } else {
      ticket.unreadByUser = false;
    }

    await ticket.save();
    res.json({ message: 'Ticket marked as read' });
  } catch (error) {
    console.error('Error marking ticket as read:', error);
    res.status(500).json({ message: 'Failed to mark ticket as read', error: error.message });
  }
});

// ============ ADMIN ROUTES ============

// Get all tickets (Admin)
router.get('/admin/tickets', async (req, res) => {
  try {
    const { status, category, priority, search, assignedTo } = req.query;
    const query = {};

    if (status) query.status = status;
    if (category) query.category = category;
    if (priority) query.priority = priority;
    if (assignedTo) query.assignedTo = assignedTo;
    if (search) {
      query.$or = [
        { subject: { $regex: search, $options: 'i' } },
        { ticketNumber: { $regex: search, $options: 'i' } },
        { 'createdBy.name': { $regex: search, $options: 'i' } },
        { 'createdBy.email': { $regex: search, $options: 'i' } }
      ];
    }

    const tickets = await SupportTicket.find(query)
      .sort({ lastReplyAt: -1 })
      .populate('assignedTo', 'fullName email')
      .populate('relatedOrder')
      .populate('relatedProduct', 'name image');

    // Get unread count
    const unreadCount = await SupportTicket.countDocuments({ unreadByAdmin: true });

    res.json({ tickets, unreadCount });
  } catch (error) {
    console.error('Error fetching admin tickets:', error);
    res.status(500).json({ message: 'Failed to fetch tickets', error: error.message });
  }
});

// Update ticket status (Admin)
router.patch('/admin/tickets/:ticketId/status', async (req, res) => {
  try {
    const { status, adminId } = req.body;
    const ticket = await SupportTicket.findById(req.params.ticketId);

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    ticket.status = status;
    
    if (status === 'closed' || status === 'resolved') {
      ticket.closedAt = new Date();
      ticket.closedBy = adminId;
    }

    await ticket.save();

    // Notify ticket creator
    await Notification.create({
      user: ticket.createdBy.userId,
      userType: ticket.createdBy.userType.toLowerCase(),
      type: 'support',
      title: 'Ticket Status Updated',
      message: `Your ticket #${ticket.ticketNumber} status changed to ${status}`,
      link: `/support/tickets/${ticket._id}`
    });

    res.json({ message: 'Ticket status updated', ticket });
  } catch (error) {
    console.error('Error updating ticket status:', error);
    res.status(500).json({ message: 'Failed to update ticket status', error: error.message });
  }
});

// Assign ticket to admin
router.patch('/admin/tickets/:ticketId/assign', async (req, res) => {
  try {
    const { adminId } = req.body;
    const ticket = await SupportTicket.findById(req.params.ticketId);

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    ticket.assignedTo = adminId;
    await ticket.save();

    res.json({ message: 'Ticket assigned successfully', ticket });
  } catch (error) {
    console.error('Error assigning ticket:', error);
    res.status(500).json({ message: 'Failed to assign ticket', error: error.message });
  }
});

// Update ticket priority (Admin)
router.patch('/admin/tickets/:ticketId/priority', async (req, res) => {
  try {
    const { priority } = req.body;
    const ticket = await SupportTicket.findById(req.params.ticketId);

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    ticket.priority = priority;
    await ticket.save();

    res.json({ message: 'Ticket priority updated', ticket });
  } catch (error) {
    console.error('Error updating ticket priority:', error);
    res.status(500).json({ message: 'Failed to update ticket priority', error: error.message });
  }
});

// Add internal note (Admin only)
router.patch('/admin/tickets/:ticketId/note', async (req, res) => {
  try {
    const { note } = req.body;
    const ticket = await SupportTicket.findById(req.params.ticketId);

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    ticket.internalNotes = note;
    await ticket.save();

    res.json({ message: 'Internal note added', ticket });
  } catch (error) {
    console.error('Error adding internal note:', error);
    res.status(500).json({ message: 'Failed to add internal note', error: error.message });
  }
});

// Get ticket statistics (Admin)
router.get('/admin/stats', async (req, res) => {
  try {
    const totalTickets = await SupportTicket.countDocuments();
    const openTickets = await SupportTicket.countDocuments({ status: 'open' });
    const pendingTickets = await SupportTicket.countDocuments({ status: 'pending' });
    const resolvedTickets = await SupportTicket.countDocuments({ status: 'resolved' });
    const closedTickets = await SupportTicket.countDocuments({ status: 'closed' });
    const unreadTickets = await SupportTicket.countDocuments({ unreadByAdmin: true });

    // Category breakdown
    const categoryStats = await SupportTicket.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    // Priority breakdown
    const priorityStats = await SupportTicket.aggregate([
      { $group: { _id: '$priority', count: { $sum: 1 } } }
    ]);

    res.json({
      totalTickets,
      openTickets,
      pendingTickets,
      resolvedTickets,
      closedTickets,
      unreadTickets,
      categoryStats,
      priorityStats
    });
  } catch (error) {
    console.error('Error fetching ticket stats:', error);
    res.status(500).json({ message: 'Failed to fetch statistics', error: error.message });
  }
});

module.exports = router;
