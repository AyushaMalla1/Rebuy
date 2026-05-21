// Image constants and fallbacks
export const PLACEHOLDER_IMAGE = '/placeholder.svg';

// Fallback image for products
export const PRODUCT_PLACEHOLDER = PLACEHOLDER_IMAGE;

// Helper function to get image with fallback
export const getImageWithFallback = (imageUrl) => {
  return imageUrl || PLACEHOLDER_IMAGE;
};

// Helper function for image error handling
export const handleImageError = (e) => {
  e.target.onerror = null; // Prevent infinite loop
  e.target.src = PLACEHOLDER_IMAGE;
};
