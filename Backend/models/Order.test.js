const mongoose = require('mongoose');
const Order = require('./Order');

describe('Order Model - Condition Verification Fields', () => {
  
  test('should create order with default conditionVerification values', () => {
    const orderData = {
      customer: new mongoose.Types.ObjectId(),
      customerName: 'Test Customer',
      customerEmail: 'test@example.com',
      customerPhone: '1234567890',
      items: [{
        product: new mongoose.Types.ObjectId(),
        productName: 'Test Product',
        quantity: 1,
        price: 1000,
        subtotal: 1000
      }],
      paymentMethod: 'cod',
      subtotal: 1000,
      total: 1000
    };

    const order = new Order(orderData);
    
    expect(order.conditionVerification.verified).toBe(false);
    expect(order.conditionVerification.matchesDescription).toBe(null);
    expect(order.conditionVerification.disputeRaised).toBe(false);
    expect(order.conditionVerification.disputeStatus).toBe(null);
  });

  test('should accept valid matchesDescription values', () => {
    const validValues = ['yes', 'no', 'partially'];
    
    validValues.forEach(value => {
      const order = new Order({
        customer: new mongoose.Types.ObjectId(),
        customerName: 'Test Customer',
        customerEmail: 'test@example.com',
        customerPhone: '1234567890',
        items: [{
          product: new mongoose.Types.ObjectId(),
          productName: 'Test Product',
          quantity: 1,
          price: 1000,
          subtotal: 1000
        }],
        paymentMethod: 'cod',
        subtotal: 1000,
        total: 1000,
        conditionVerification: {
          verified: true,
          matchesDescription: value,
          conditionRating: 4
        }
      });
      
      expect(order.conditionVerification.matchesDescription).toBe(value);
    });
  });

  test('should accept valid conditionRating between 1 and 5', () => {
    const order = new Order({
      customer: new mongoose.Types.ObjectId(),
      customerName: 'Test Customer',
      customerEmail: 'test@example.com',
      customerPhone: '1234567890',
      items: [{
        product: new mongoose.Types.ObjectId(),
        productName: 'Test Product',
        quantity: 1,
        price: 1000,
        subtotal: 1000
      }],
      paymentMethod: 'cod',
      subtotal: 1000,
      total: 1000,
      conditionVerification: {
        verified: true,
        conditionRating: 3
      }
    });
    
    expect(order.conditionVerification.conditionRating).toBe(3);
  });

  test('should store verification images array', () => {
    const images = ['https://example.com/img1.jpg', 'https://example.com/img2.jpg'];
    
    const order = new Order({
      customer: new mongoose.Types.ObjectId(),
      customerName: 'Test Customer',
      customerEmail: 'test@example.com',
      customerPhone: '1234567890',
      items: [{
        product: new mongoose.Types.ObjectId(),
        productName: 'Test Product',
        quantity: 1,
        price: 1000,
        subtotal: 1000
      }],
      paymentMethod: 'cod',
      subtotal: 1000,
      total: 1000,
      conditionVerification: {
        verified: true,
        verificationImages: images
      }
    });
    
    expect(order.conditionVerification.verificationImages).toEqual(images);
  });

  test('should store dispute fields correctly', () => {
    const order = new Order({
      customer: new mongoose.Types.ObjectId(),
      customerName: 'Test Customer',
      customerEmail: 'test@example.com',
      customerPhone: '1234567890',
      items: [{
        product: new mongoose.Types.ObjectId(),
        productName: 'Test Product',
        quantity: 1,
        price: 1000,
        subtotal: 1000
      }],
      paymentMethod: 'cod',
      subtotal: 1000,
      total: 1000,
      conditionVerification: {
        verified: true,
        matchesDescription: 'no',
        disputeRaised: true,
        disputeReason: 'Product damaged',
        disputeEvidence: ['https://example.com/evidence1.jpg'],
        disputeStatus: 'pending'
      }
    });
    
    expect(order.conditionVerification.disputeRaised).toBe(true);
    expect(order.conditionVerification.disputeReason).toBe('Product damaged');
    expect(order.conditionVerification.disputeEvidence).toHaveLength(1);
    expect(order.conditionVerification.disputeStatus).toBe('pending');
  });

  test('should accept valid disputeStatus values', () => {
    const validStatuses = ['pending', 'resolved', 'rejected'];
    
    validStatuses.forEach(status => {
      const order = new Order({
        customer: new mongoose.Types.ObjectId(),
        customerName: 'Test Customer',
        customerEmail: 'test@example.com',
        customerPhone: '1234567890',
        items: [{
          product: new mongoose.Types.ObjectId(),
          productName: 'Test Product',
          quantity: 1,
          price: 1000,
          subtotal: 1000
        }],
        paymentMethod: 'cod',
        subtotal: 1000,
        total: 1000,
        conditionVerification: {
          disputeRaised: true,
          disputeStatus: status
        }
      });
      
      expect(order.conditionVerification.disputeStatus).toBe(status);
    });
  });

  test('should store customerFeedback text', () => {
    const feedback = 'Product was in excellent condition, exactly as described!';
    
    const order = new Order({
      customer: new mongoose.Types.ObjectId(),
      customerName: 'Test Customer',
      customerEmail: 'test@example.com',
      customerPhone: '1234567890',
      items: [{
        product: new mongoose.Types.ObjectId(),
        productName: 'Test Product',
        quantity: 1,
        price: 1000,
        subtotal: 1000
      }],
      paymentMethod: 'cod',
      subtotal: 1000,
      total: 1000,
      conditionVerification: {
        verified: true,
        customerFeedback: feedback
      }
    });
    
    expect(order.conditionVerification.customerFeedback).toBe(feedback);
  });

  test('should store verifiedAt and resolvedAt timestamps', () => {
    const verifiedDate = new Date('2024-03-15');
    const resolvedDate = new Date('2024-03-20');
    
    const order = new Order({
      customer: new mongoose.Types.ObjectId(),
      customerName: 'Test Customer',
      customerEmail: 'test@example.com',
      customerPhone: '1234567890',
      items: [{
        product: new mongoose.Types.ObjectId(),
        productName: 'Test Product',
        quantity: 1,
        price: 1000,
        subtotal: 1000
      }],
      paymentMethod: 'cod',
      subtotal: 1000,
      total: 1000,
      conditionVerification: {
        verified: true,
        verifiedAt: verifiedDate,
        disputeRaised: true,
        disputeStatus: 'resolved',
        resolvedAt: resolvedDate
      }
    });
    
    expect(order.conditionVerification.verifiedAt).toEqual(verifiedDate);
    expect(order.conditionVerification.resolvedAt).toEqual(resolvedDate);
  });
});
