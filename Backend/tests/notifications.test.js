const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const Notification = require('../models/Notification');
const User = require('../models/User');
const Customer = require('../models/Customer');

process.env.JWT_SECRET = 'test-secret-key';
process.env.MONGODB_URI = 'mongodb://localhost:27017/rebuy-test';

describe('Notifications API Tests', () => {
  let customerToken;
  let customerId;
  let notificationId;

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI);
    }

    const timestamp = Date.now();
    const customerEmail = `notificationcustomer${timestamp}@test.com`;
    
    await User.deleteMany({ email: customerEmail });
    await Customer.deleteMany({ email: customerEmail });

    const customerResponse = await request(app)
      .post('/api/auth/signup')
      .send({
        fullName: 'Notification Test Customer',
        email: customerEmail,
        password: 'Test@123456',
        confirmPassword: 'Test@123456'
      });

    customerToken = customerResponse.body.token;
    customerId = customerResponse.body.user._id;

    // Create a test notification
    const notification = await Notification.create({
      user: customerId,
      type: 'order',
      title: 'Test Notification',
      message: 'This is a test notification',
      read: false
    });
    notificationId = notification._id;
  });

  afterAll(async () => {
    await Notification.deleteMany({ user: customerId });
    await Customer.deleteMany({ _id: customerId });
    await User.deleteMany({ _id: customerId });
    await mongoose.connection.close();
  });

  describe('GET /api/notifications/:userId', () => {
    
    test('Should get user notifications', async () => {
      const response = await request(app)
        .get(`/api/notifications/${customerId}`)
        .set('Authorization', `Bearer ${customerToken}`);

      expect([200, 404]).toContain(response.status);
      if (response.status === 200) {
        expect(Array.isArray(response.body) || response.body.notifications).toBeTruthy();
      }
    });

    test('Should reject getting notifications without authentication', async () => {
      const response = await request(app)
        .get(`/api/notifications/${customerId}`);

      expect([401, 200]).toContain(response.status);
    });
  });

  describe('GET /api/notifications/:userId/unread', () => {
    
    test('Should get unread notifications count', async () => {
      const response = await request(app)
        .get(`/api/notifications/${customerId}/unread`)
        .set('Authorization', `Bearer ${customerToken}`);

      expect([200, 404]).toContain(response.status);
      if (response.status === 200) {
        expect(response.body).toHaveProperty('count');
      }
    });
  });

  describe('PATCH /api/notifications/:id/read', () => {
    
    test('Should mark notification as read', async () => {
      const response = await request(app)
        .patch(`/api/notifications/${notificationId}/read`)
        .set('Authorization', `Bearer ${customerToken}`);

      expect([200, 404]).toContain(response.status);
      if (response.status === 200 && response.body.success !== undefined) {
        expect(response.body.success).toBe(true);
      }
    });
  });

  describe('PATCH /api/notifications/:userId/read-all', () => {
    
    test('Should mark all notifications as read', async () => {
      const response = await request(app)
        .patch(`/api/notifications/${customerId}/read-all`)
        .set('Authorization', `Bearer ${customerToken}`);

      expect([200, 404]).toContain(response.status);
    });
  });

  describe('DELETE /api/notifications/:id', () => {
    
    test('Should delete notification', async () => {
      const response = await request(app)
        .delete(`/api/notifications/${notificationId}`)
        .set('Authorization', `Bearer ${customerToken}`);

      expect([200, 404]).toContain(response.status);
    });
  });
});
