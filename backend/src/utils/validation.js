/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} - True if email is valid
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone number format
 * @param {string} phone - Phone number to validate
 * @returns {boolean} - True if phone number is valid
 */
const isValidPhone = (phone) => {
  // Basic phone format validation - adjust based on your requirements
  const phoneRegex = /^\+?[0-9]{10,15}$/;
  return phoneRegex.test(phone);
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {Object} - Validation result with isValid flag and message
 */
const validatePassword = (password) => {
  if (password.length < 8) {
    return {
      isValid: false,
      message: 'Password must be at least 8 characters long'
    };
  }
  
  // Check for at least one uppercase letter, one lowercase letter, one number
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  
  if (!hasUppercase || !hasLowercase || !hasNumber) {
    return {
      isValid: false,
      message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    };
  }
  
  return {
    isValid: true,
    message: 'Password is valid'
  };
};

/**
 * Validate order data
 * @param {Object} orderData - Order data to validate
 * @returns {Object} - Validation result with isValid flag and errors
 */
const validateOrderData = (orderData) => {
  const errors = {};
  
  // Check if items exist and is an array
  if (!orderData.items || !Array.isArray(orderData.items) || orderData.items.length === 0) {
    errors.items = 'Order must contain at least one item';
  } else {
    // Validate each item
    orderData.items.forEach((item, index) => {
      if (!item.dishId) {
        errors[`items[${index}].dishId`] = 'Dish ID is required';
      }
      if (!item.quantity || item.quantity < 1) {
        errors[`items[${index}].quantity`] = 'Quantity must be at least 1';
      }
    });
  }
  
  // Check delivery address
  if (!orderData.deliveryAddress || orderData.deliveryAddress.trim() === '') {
    errors.deliveryAddress = 'Delivery address is required';
  }
  
  // Check payment method
  if (!orderData.paymentMethod || orderData.paymentMethod.trim() === '') {
    errors.paymentMethod = 'Payment method is required';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

module.exports = {
  isValidEmail,
  isValidPhone,
  validatePassword,
  validateOrderData
};
