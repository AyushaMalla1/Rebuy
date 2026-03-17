/**
 * Discount Validation and Calculation Utilities
 * 
 * This module provides functions for validating discount configurations,
 * calculating discounted prices, and checking discount active status.
 * 
 * Requirements: 2.1, 2.2, 2.3, 2.6, 9.2, 9.3
 */

/**
 * Validates a discount configuration object
 * 
 * @param {Object} discount - The discount configuration to validate
 * @param {number} discount.percentage - Discount percentage (0-100)
 * @param {Date|string} discount.startDate - Discount start date
 * @param {Date|string} discount.endDate - Discount end date
 * @param {boolean} discount.active - Whether discount is active
 * @returns {Object} Validation result with isValid boolean and errors array
 * 
 * Validates Requirements:
 * - 2.1: Discount percentage must be between 0 and 100
 * - 2.2: Start date must be before end date
 * - 9.2: Discount percentages are between 0 and 100
 * - 9.3: Discount start dates are before end dates
 */
function validateDiscount(discount) {
  const errors = [];

  // Check if discount object exists
  if (!discount || typeof discount !== 'object') {
    return {
      isValid: false,
      errors: ['Discount configuration is required']
    };
  }

  // Validate percentage (Requirement 2.1, 9.2)
  if (typeof discount.percentage !== 'number') {
    errors.push('Discount percentage must be a number');
  } else if (discount.percentage < 0 || discount.percentage > 100) {
    errors.push('Discount percentage must be between 0 and 100');
  }

  // Validate dates exist
  if (!discount.startDate) {
    errors.push('Discount start date is required');
  }
  if (!discount.endDate) {
    errors.push('Discount end date is required');
  }

  // Validate date ordering (Requirement 2.2, 9.3)
  if (discount.startDate && discount.endDate) {
    const startDate = new Date(discount.startDate);
    const endDate = new Date(discount.endDate);

    // Check for invalid dates
    if (isNaN(startDate.getTime())) {
      errors.push('Invalid start date format');
    }
    if (isNaN(endDate.getTime())) {
      errors.push('Invalid end date format');
    }

    // Check date ordering
    if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
      if (startDate >= endDate) {
        errors.push('Start date must be before end date');
      }
    }
  }

  // Validate active flag
  if (typeof discount.active !== 'boolean') {
    errors.push('Discount active flag must be a boolean');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Checks if a discount is currently active
 * 
 * @param {Object} discount - The discount configuration to check
 * @param {number} discount.percentage - Discount percentage
 * @param {Date|string} discount.startDate - Discount start date
 * @param {Date|string} discount.endDate - Discount end date
 * @param {boolean} discount.active - Whether discount is marked as active
 * @returns {boolean} True if discount is active and within date range, false otherwise
 * 
 * Validates Requirements:
 * - 2.3: Discount is active when active flag is true and current date is within range
 */
function isDiscountActive(discount) {
  // Check if discount exists
  if (!discount || typeof discount !== 'object') {
    return false;
  }

  // Check if discount is marked as active
  if (discount.active !== true) {
    return false;
  }

  // Check if dates are valid
  if (!discount.startDate || !discount.endDate) {
    return false;
  }

  const currentDate = new Date();
  const startDate = new Date(discount.startDate);
  const endDate = new Date(discount.endDate);

  // Check for invalid dates
  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    return false;
  }

  // Check if current date is within discount period
  return currentDate >= startDate && currentDate <= endDate;
}

/**
 * Calculates the discounted price for a product
 * 
 * @param {number} originalPrice - The original product price
 * @param {Object} discount - The discount configuration
 * @param {number} discount.percentage - Discount percentage (0-100)
 * @param {Date|string} discount.startDate - Discount start date
 * @param {Date|string} discount.endDate - Discount end date
 * @param {boolean} discount.active - Whether discount is active
 * @returns {number} The discounted price rounded to 2 decimal places, or original price if discount is not active
 * 
 * Validates Requirements:
 * - 2.3: Calculate and display discounted price when discount is active
 * - 2.6: Round all discounted prices to two decimal places
 */
function calculateDiscountedPrice(originalPrice, discount) {
  // Validate original price
  if (typeof originalPrice !== 'number' || originalPrice < 0) {
    throw new Error('Original price must be a non-negative number');
  }

  // If no discount or discount is not active, return original price
  if (!discount || !isDiscountActive(discount)) {
    return originalPrice;
  }

  // Validate discount percentage
  if (typeof discount.percentage !== 'number' || discount.percentage < 0 || discount.percentage > 100) {
    return originalPrice;
  }

  // Calculate discount amount
  const discountAmount = originalPrice * (discount.percentage / 100);
  
  // Calculate final price
  const discountedPrice = originalPrice - discountAmount;

  // Round to 2 decimal places (Requirement 2.6)
  return Math.round(discountedPrice * 100) / 100;
}

module.exports = {
  validateDiscount,
  isDiscountActive,
  calculateDiscountedPrice
};
