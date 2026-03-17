/**
 * Payment Options Utility Functions
 * 
 * Provides validation and helper functions for managing payment options
 * in the Rebuy marketplace platform.
 */

/**
 * Get the list of available payment options
 * @returns {string[]} Array of valid payment option types
 */
function getAvailableOptions() {
  return ['cod', 'online', 'esewa', 'khalti', 'card'];
}

/**
 * Validate payment options array
 * 
 * Preconditions:
 * - options is a non-null array
 * - Array length is between 1 and 4
 * 
 * Postconditions:
 * - Returns true if all options are valid payment types
 * - Returns false if any option is invalid or array is empty
 * - No side effects on input array
 * 
 * @param {string[]} options - Array of payment option strings to validate
 * @returns {boolean} True if valid, false otherwise
 */
function validatePaymentOptions(options) {
  // Check if options is an array
  if (!Array.isArray(options)) {
    return false;
  }
  
  // Check array length (1-4 options required)
  if (options.length < 1 || options.length > 4) {
    return false;
  }
  
  const validOptions = getAvailableOptions();
  
  // Check if all options are valid types
  for (const option of options) {
    if (!validOptions.includes(option)) {
      return false;
    }
  }
  
  // Check for duplicates
  const uniqueOptions = new Set(options);
  if (uniqueOptions.size !== options.length) {
    return false;
  }
  
  return true;
}

module.exports = {
  validatePaymentOptions,
  getAvailableOptions
};
