const mongoose = require('mongoose');
const Seller = require('./Seller');

describe('Seller Model', () => {
  describe('Schema Structure', () => {
    it('should have trustScore object with all required fields', () => {
      const seller = new Seller({
        fullName: 'Test Seller',
        email: 'test@example.com',
        password: 'password123',
        phone: '1234567890',
        storeName: 'Test Store',
        address: '123 Test St',
        city: 'Test City'
      });

      expect(seller.trustScore).toBeDefined();
      expect(seller.trustScore.score).toBe(50);
      expect(seller.trustScore.totalVerifications).toBe(0);
      expect(seller.trustScore.positiveVerifications).toBe(0);
      expect(seller.trustScore.partialVerifications).toBe(0);
      expect(seller.trustScore.negativeVerifications).toBe(0);
      expect(seller.trustScore.lastUpdated).toBeDefined();
    });

    it('should have approvalData object with all required fields', () => {
      const seller = new Seller({
        fullName: 'Test Seller',
        email: 'test@example.com',
        password: 'password123',
        phone: '1234567890',
        storeName: 'Test Store',
        address: '123 Test St',
        city: 'Test City'
      });

      expect(seller.approvalData).toBeDefined();
      expect(seller.approvalData.approvedBy).toBeNull();
      expect(seller.approvalData.approvedAt).toBeNull();
      expect(seller.approvalData.rejectionReason).toBe('');
      expect(seller.approvalData.suspensionReason).toBe('');
      expect(seller.approvalData.adminNotes).toBe('');
    });

    it('should include suspended in status enum', () => {
      const seller = new Seller({
        fullName: 'Test Seller',
        email: 'test@example.com',
        password: 'password123',
        phone: '1234567890',
        storeName: 'Test Store',
        address: '123 Test St',
        city: 'Test City',
        status: 'suspended'
      });

      expect(seller.status).toBe('suspended');
    });

    it('should enforce trustScore bounds', () => {
      const seller = new Seller({
        fullName: 'Test Seller',
        email: 'test@example.com',
        password: 'password123',
        phone: '1234567890',
        storeName: 'Test Store',
        address: '123 Test St',
        city: 'Test City'
      });

      // Test min bound
      seller.trustScore.score = -10;
      const minError = seller.validateSync();
      expect(minError).toBeDefined();
      expect(minError.errors['trustScore.score']).toBeDefined();

      // Test max bound
      seller.trustScore.score = 150;
      const maxError = seller.validateSync();
      expect(maxError).toBeDefined();
      expect(maxError.errors['trustScore.score']).toBeDefined();

      // Test valid value
      seller.trustScore.score = 75;
      const validError = seller.validateSync();
      expect(validError).toBeUndefined();
    });
  });
});
