import React, { createContext, useState, useContext, useEffect } from 'react';
import { toast } from 'react-toastify';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [totalItems, setTotalItems] = useState(0);

  // Load cart from local storage on initial load
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        setCartItems(parsedCart);
      } catch (error) {
        console.error('Failed to parse saved cart', error);
        localStorage.removeItem('cart');
      }
    }
  }, []);

  // Save cart to local storage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
    
    // Calculate totals
    let price = 0;
    let items = 0;
    
    cartItems.forEach(item => {
      // Base price calculation
      const itemTotal = item.price * item.quantity;
      
      // Add extra costs if any
      let extrasCost = 0;
      if (item.extras && item.extras.length > 0) {
        item.extras.forEach(extra => {
          if (extra.price) {
            extrasCost += extra.price;
          }
        });
      }
      
      price += itemTotal + (extrasCost * item.quantity);
      items += item.quantity;
    });
    
    setTotalPrice(price);
    setTotalItems(items);
  }, [cartItems]);

  // Add item to cart
  const addToCart = (dish, quantity = 1, extras = [], exclusions = []) => {
    setCartItems(prevItems => {
      // Check if item already exists in cart
      const existingItemIndex = prevItems.findIndex(
        item => item.id === dish.id && 
               JSON.stringify(item.extras) === JSON.stringify(extras) &&
               JSON.stringify(item.exclusions) === JSON.stringify(exclusions)
      );
      
      if (existingItemIndex >= 0) {
        // Update existing item quantity
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex].quantity += quantity;
        toast.success(`Updated quantity for ${dish.name}`);
        return updatedItems;
      } else {
        // Add new item to cart
        toast.success(`Added ${dish.name} to cart`);
        return [...prevItems, {
          id: dish.id,
          name: dish.name,
          price: dish.price,
          image: dish.imageUrl,
          quantity,
          extras,
          exclusions
        }];
      }
    });
  };

  // Update item quantity
  const updateQuantity = (itemIndex, quantity) => {
    if (quantity < 1) return;
    
    setCartItems(prevItems => {
      const updatedItems = [...prevItems];
      updatedItems[itemIndex].quantity = quantity;
      return updatedItems;
    });
  };

  // Remove item from cart
  const removeFromCart = (itemIndex) => {
    setCartItems(prevItems => {
      const item = prevItems[itemIndex];
      toast.info(`Removed ${item.name} from cart`);
      return prevItems.filter((_, index) => index !== itemIndex);
    });
  };

  // Clear cart
  const clearCart = () => {
    setCartItems([]);
    toast.info('Cart cleared');
  };

  // Prepare cart items for checkout
  const prepareForCheckout = () => {
    return cartItems.map(item => ({
      dishId: item.id,
      quantity: item.quantity,
      extras: item.extras,
      exclusions: item.exclusions
    }));
  };

  const value = {
    cartItems,
    totalPrice,
    totalItems,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    prepareForCheckout
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
