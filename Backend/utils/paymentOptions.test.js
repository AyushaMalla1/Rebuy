const { validatePaymentOptions, getAvailableOptions } = require('./paymentOptions');

describe('Payment Options Utilities', () => {
  describe('getAvailableOptions', () => {
    test('should return array of valid payment options', () => {
      const options = getAvailableOptions();
      expect(Array.isArray(options)).toBe(true);
      expect(options).toEqual(['cod', 'online', 'esewa', 'khalti', 'card']);
    });

    test('should return exactly 5 payment options', () => {
      const options = getAvailableOptions();
      expect(options.length).toBe(5);
    });
  });

  describe('validatePaymentOptions', () => {
    describe('valid cases', () => {
      test('should accept single valid option', () => {
        expect(validatePaymentOptions(['cod'])).toBe(true);
        expect(validatePaymentOptions(['esewa'])).toBe(true);
        expect(validatePaymentOptions(['khalti'])).toBe(true);
      });

      test('should accept two valid options', () => {
        expect(validatePaymentOptions(['cod', 'esewa'])).toBe(true);
        expect(validatePaymentOptions(['khalti', 'card'])).toBe(true);
      });

      test('should accept three valid options', () => {
        expect(validatePaymentOptions(['cod', 'esewa', 'khalti'])).toBe(true);
      });

      test('should accept four valid options', () => {
        expect(validatePaymentOptions(['cod', 'esewa', 'khalti', 'card'])).toBe(true);
      });
    });

    describe('invalid cases - array length', () => {
      test('should reject empty array', () => {
        expect(validatePaymentOptions([])).toBe(false);
      });

      test('should reject more than 4 options', () => {
        expect(validatePaymentOptions(['cod', 'online', 'esewa', 'khalti', 'card'])).toBe(false);
      });
    });

    describe('invalid cases - invalid types', () => {
      test('should reject invalid payment option', () => {
        expect(validatePaymentOptions(['invalid_option'])).toBe(false);
      });

      test('should reject array with one invalid option among valid ones', () => {
        expect(validatePaymentOptions(['cod', 'invalid', 'esewa'])).toBe(false);
      });

      test('should reject non-string values', () => {
        expect(validatePaymentOptions([123])).toBe(false);
        expect(validatePaymentOptions([null])).toBe(false);
        expect(validatePaymentOptions([undefined])).toBe(false);
      });
    });

    describe('invalid cases - duplicate options', () => {
      test('should reject duplicate payment options', () => {
        expect(validatePaymentOptions(['cod', 'cod'])).toBe(false);
        expect(validatePaymentOptions(['esewa', 'khalti', 'esewa'])).toBe(false);
      });
    });

    describe('invalid cases - non-array input', () => {
      test('should reject null', () => {
        expect(validatePaymentOptions(null)).toBe(false);
      });

      test('should reject undefined', () => {
        expect(validatePaymentOptions(undefined)).toBe(false);
      });

      test('should reject string', () => {
        expect(validatePaymentOptions('cod')).toBe(false);
      });

      test('should reject object', () => {
        expect(validatePaymentOptions({ option: 'cod' })).toBe(false);
      });

      test('should reject number', () => {
        expect(validatePaymentOptions(123)).toBe(false);
      });
    });
  });
});
