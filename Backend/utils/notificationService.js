const Notification = require('../models/Notification');

// Helper function to create notifications
const createNotification = async (sellerId, type, title, message, severity = 'info', relatedId = null, relatedModel = null) => {
  try {
    const notification = new Notification({
      sellerId,
      type,
      title,
      message,
      severity,
      relatedId,
      relatedModel
    });

    await notification.save();
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

// Notification templates
const notificationTemplates = {
  // Order notifications
  newOrder: (orderId) => ({
    type: 'order',
    title: 'New Order Received',
    message: `You have received a new order #${orderId}`,
    severity: 'success',
    relatedModel: 'Order'
  }),

  orderCancelled: (orderId) => ({
    type: 'order',
    title: 'Order Cancelled',
    message: `Order #${orderId} has been cancelled`,
    severity: 'warning',
    relatedModel: 'Order'
  }),

  // Product notifications
  productApproved: (productName) => ({
    type: 'product',
    title: 'Product Approved',
    message: `Your product "${productName}" has been approved`,
    severity: 'success',
    relatedModel: 'Product'
  }),

  productRejected: (productName) => ({
    type: 'product',
    title: 'Product Rejected',
    message: `Your product "${productName}" has been rejected`,
    severity: 'error',
    relatedModel: 'Product'
  }),

  // Stock notifications
  lowStock: (productName, quantity) => ({
    type: 'stock',
    title: 'Low Stock Alert',
    message: `${productName} is running low (${quantity} units remaining)`,
    severity: 'warning',
    relatedModel: 'Product'
  }),

  outOfStock: (productName) => ({
    type: 'stock',
    title: 'Out of Stock',
    message: `${productName} is now out of stock`,
    severity: 'error',
    relatedModel: 'Product'
  }),

  // Message notifications
  newMessage: (customerName) => ({
    type: 'message',
    title: 'New Message',
    message: `You have a new message from ${customerName}`,
    severity: 'info',
    relatedModel: 'Message'
  }),

  // System notifications
  systemUpdate: (message) => ({
    type: 'system',
    title: 'System Update',
    message: message,
    severity: 'info'
  })
};

// Send notification using template
const sendNotification = async (sellerId, templateName, ...args) => {
  try {
    const template = notificationTemplates[templateName];
    if (!template) {
      throw new Error(`Notification template "${templateName}" not found`);
    }

    const notificationData = template(...args);
    return await createNotification(
      sellerId,
      notificationData.type,
      notificationData.title,
      notificationData.message,
      notificationData.severity,
      args[args.length - 1], // Assume last arg is relatedId if provided
      notificationData.relatedModel
    );
  } catch (error) {
    console.error('Error sending notification:', error);
    throw error;
  }
};

module.exports = {
  createNotification,
  sendNotification,
  notificationTemplates
};
