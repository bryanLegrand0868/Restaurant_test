// API URLs
export const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Order Status Constants
export const ORDER_STATUS = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  PREPARING: 'PREPARING',
  READY_FOR_DELIVERY: 'READY_FOR_DELIVERY',
  OUT_FOR_DELIVERY: 'OUT_FOR_DELIVERY',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED'
};

// Order Status Display Names
export const ORDER_STATUS_DISPLAY = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  PREPARING: 'Preparing',
  READY_FOR_DELIVERY: 'Ready for Delivery',
  OUT_FOR_DELIVERY: 'Out for Delivery',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled'
};

// Admin Roles
export const ADMIN_ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  KITCHEN_MANAGER: 'KITCHEN_MANAGER',
  CUSTOMER_SUPPORT: 'CUSTOMER_SUPPORT',
  CONTENT_MANAGER: 'CONTENT_MANAGER'
};

// Payment Methods
export const PAYMENT_METHODS = [
  { value: 'CREDIT_CARD', label: 'Credit Card' },
  { value: 'DEBIT_CARD', label: 'Debit Card' },
  { value: 'PAYPAL', label: 'PayPal' },
  { value: 'CASH_ON_DELIVERY', label: 'Cash on Delivery' }
];

// Dietary Preferences
export const DIETARY_PREFERENCES = [
  { value: 'VEGETARIAN', label: 'Vegetarian' },
  { value: 'VEGAN', label: 'Vegan' },
  { value: 'GLUTEN_FREE', label: 'Gluten Free' },
  { value: 'DAIRY_FREE', label: 'Dairy Free' },
  { value: 'NUT_FREE', label: 'Nut Free' },
  { value: 'LOW_CARB', label: 'Low Carb' }
];

// Image placeholder
export const DEFAULT_IMAGE = 'https://via.placeholder.com/300x200?text=No+Image';

// Price formatter
export const formatPrice = (price) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(price);
};
