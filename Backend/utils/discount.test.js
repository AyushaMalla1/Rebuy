/**
 * Unit Tests for Discount Utilities
 * 
 * Tests for validateDiscount(), isDiscountActive(), and calculateDiscountedPrice()
 */

const { validateDiscount, isDiscountActive, calculateDiscountedPrice } = require('./discount');

describe('Discount Utilities', () => {
  describe('validateDiscount()', () => {
    test('should validate a correct discount configuration', () => {
      const discount = {
        percentage: 20,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        active: true
      };

      const result = validateDiscount(discount);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should reject discount with percentage below 0', () => {
      const discount = {
        percentage: -5,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        active: true
      };

      const result = validateDiscount(discount);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Discount percentage must be between 0 and 100');
    });

    test('should reject discount with percentage above 100', () => {
      const discount = {
        percentage: 150,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        active: true
      };

      const result = validateDiscount(discount);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Discount percentage must be between 0 and 100');
    });

    test('should accept discount with 0% percentage', () => {
      const discount = {
        percentage: 0,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        active: true
      };

      const result = validateDiscount(discount);
      expect(result.isValid).toBe(true);
    });

    test('should accept discount with 100% percentage', () => {
      const discount = {
        percentage: 100,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        active: true
      };

      const result = validateDiscount(discount);
      expect(result.isValid).toBe(true);
    });

    test('should reject discount with start date after end date', () => {
      const discount = {
        percentage: 20,
        startDate: new Date('2024-12-31'),
        endDate: new Date('2024-01-01'),
        active: true
      };

      const result = validateDiscount(discount);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Start date must be before end date');
    });

    test('should reject discount with equal start and end dates', () => {
      const discount = {
        percentage: 20,
        startDate: new Date('2024-06-15'),
        endDate: new Date('2024-06-15'),
        active: true
      };

      const result = validateDiscount(discount);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Start date must be before end date');
    });

    test('should reject discount with missing start date', () => {
      const discount = {
        percentage: 20,
        endDate: new Date('2024-12-31'),
        active: true
      };

      const result = validateDiscount(discount);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Discount start date is required');
    });

    test('should reject discount with missing end date', () => {
      const discount = {
        percentage: 20,
        startDate: new Date('2024-01-01'),
        active: true
      };

      const result = validateDiscount(discount);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Discount end date is required');
    });

    test('should reject discount with invalid date format', () => {
      const discount = {
        percentage: 20,
        startDate: 'invalid-date',
        endDate: new Date('2024-12-31'),
        active: true
      };

      const result = validateDiscount(discount);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid start date format');
    });

    test('should reject discount with non-boolean active flag', () => {
      const discount = {
        percentage: 20,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        active: 'yes'
      };

      const result = validateDiscount(discount);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Discount active flag must be a boolean');
    });

    test('should reject null discount', () => {
      const result = validateDiscount(null);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Discount configuration is required');
    });

    test('should reject undefined discount', () => {
      const result = validateDiscount(undefined);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Discount configuration is required');
    });

    test('should handle string dates correctly', () => {
      const discount = {
        percentage: 20,
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        active: true
      };

      const result = validateDiscount(discount);
      expect(result.isValid).toBe(true);
    });
  });

  describe('isDiscountActive()', () => {
    test('should return true for active discount within date range', () => {
      const now = new Date();
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const discount = {
        percentage: 20,
        startDate: yesterday,
        endDate: tomorrow,
        active: true
      };

      expect(isDiscountActive(discount)).toBe(true);
    });

    test('should return false for inactive discount', () => {
      const now = new Date();
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const discount = {
        percentage: 20,
        startDate: yesterday,
        endDate: tomorrow,
        active: false
      };

      expect(isDiscountActive(discount)).toBe(false);
    });

    test('should return false for discount before start date', () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const nextWeek = new Date(now);
      nextWeek.setDate(nextWeek.getDate() + 7);

      const discount = {
        percentage: 20,
        startDate: tomorrow,
        endDate: nextWeek,
        active: true
      };

      expect(isDiscountActive(discount)).toBe(false);
    });

    test('should return false for discount after end date', () => {
      const now = new Date();
      const lastWeek = new Date(now);
      lastWeek.setDate(lastWeek.getDate() - 7);
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);

      const discount = {
        percentage: 20,
        startDate: lastWeek,
        endDate: yesterday,
        active: true
      };

      expect(isDiscountActive(discount)).toBe(false);
    });

    test('should return false for null discount', () => {
      expect(isDiscountActive(null)).toBe(false);
    });

    test('should return false for undefined discount', () => {
      expect(isDiscountActive(undefined)).toBe(false);
    });

    test('should return false for discount with missing dates', () => {
      const discount = {
        percentage: 20,
        active: true
      };

      expect(isDiscountActive(discount)).toBe(false);
    });

    test('should return false for discount with invalid dates', () => {
      const discount = {
        percentage: 20,
        startDate: 'invalid',
        endDate: 'invalid',
        active: true
      };

      expect(isDiscountActive(discount)).toBe(false);
    });

    test('should handle string dates correctly', () => {
      const now = new Date();
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const discount = {
        percentage: 20,
        startDate: yesterday.toISOString(),
        endDate: tomorrow.toISOString(),
        active: true
      };

      expect(isDiscountActive(discount)).toBe(true);
    });
  });

  describe('calculateDiscountedPrice()', () => {
    test('should calculate correct discounted price for active discount', () => {
      const now = new Date();
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const discount = {
        percentage: 20,
        startDate: yesterday,
        endDate: tomorrow,
        active: true
      };

      const result = calculateDiscountedPrice(1000, discount);
      expect(result).toBe(800);
    });

    test('should return original price for inactive discount', () => {
      const now = new Date();
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const discount = {
        percentage: 20,
        startDate: yesterday,
        endDate: tomorrow,
        active: false
      };

      const result = calculateDiscountedPrice(1000, discount);
      expect(result).toBe(1000);
    });

    test('should return original price for discount outside date range', () => {
      const now = new Date();
      const lastWeek = new Date(now);
      lastWeek.setDate(lastWeek.getDate() - 7);
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);

      const discount = {
        percentage: 20,
        startDate: lastWeek,
        endDate: yesterday,
        active: true
      };

      const result = calculateDiscountedPrice(1000, discount);
      expect(result).toBe(1000);
    });

    test('should round to 2 decimal places', () => {
      const now = new Date();
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const discount = {
        percentage: 15,
        startDate: yesterday,
        endDate: tomorrow,
        active: true
      };

      const result = calculateDiscountedPrice(99.99, discount);
      expect(result).toBe(84.99);
    });

    test('should handle 0% discount', () => {
      const now = new Date();
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const discount = {
        percentage: 0,
        startDate: yesterday,
        endDate: tomorrow,
        active: true
      };

      const result = calculateDiscountedPrice(1000, discount);
      expect(result).toBe(1000);
    });

    test('should handle 100% discount', () => {
      const now = new Date();
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const discount = {
        percentage: 100,
        startDate: yesterday,
        endDate: tomorrow,
        active: true
      };

      const result = calculateDiscountedPrice(1000, discount);
      expect(result).toBe(0);
    });

    test('should return original price for null discount', () => {
      const result = calculateDiscountedPrice(1000, null);
      expect(result).toBe(1000);
    });

    test('should return original price for undefined discount', () => {
      const result = calculateDiscountedPrice(1000, undefined);
      expect(result).toBe(1000);
    });

    test('should throw error for invalid original price', () => {
      const now = new Date();
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const discount = {
        percentage: 20,
        startDate: yesterday,
        endDate: tomorrow,
        active: true
      };

      expect(() => calculateDiscountedPrice('invalid', discount)).toThrow();
      expect(() => calculateDiscountedPrice(-100, discount)).toThrow();
    });

    test('should handle complex rounding scenarios', () => {
      const now = new Date();
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const discount = {
        percentage: 33.33,
        startDate: yesterday,
        endDate: tomorrow,
        active: true
      };

      const result = calculateDiscountedPrice(100, discount);
      expect(result).toBe(66.67);
    });

    test('should calculate discount for large prices', () => {
      const now = new Date();
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const discount = {
        percentage: 25,
        startDate: yesterday,
        endDate: tomorrow,
        active: true
      };

      const result = calculateDiscountedPrice(50000, discount);
      expect(result).toBe(37500);
    });
  });
});
