import React, { createContext, useContext, useState, useEffect } from 'react';
import { cartAPI } from '../api/endpoints';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { isAuthenticated, role } = useAuth();
  const [cart, setCart] = useState({ items: [], total_amount: 0.0 });
  const [loading, setLoading] = useState(false);

  const fetchCart = async () => {
    if (isAuthenticated && role === 'customer') {
      try {
        const res = await cartAPI.getCart();
        setCart(res.data);
      } catch (err) {
        console.error("Error fetching cart:", err);
      }
    } else {
      // Local storage fallback for guests
      const saved = localStorage.getItem('agriconnect_guest_cart');
      if (saved) {
        try {
          setCart(JSON.parse(saved));
        } catch (e) {
          setCart({ items: [], total_amount: 0.0 });
        }
      }
    }
  };

  useEffect(() => {
    fetchCart();
  }, [isAuthenticated, role]);

  const addToCart = async (listing, quantity_kg = 1.0) => {
    setLoading(true);
    try {
      if (isAuthenticated && role === 'customer') {
        const res = await cartAPI.addItem({ listing_id: listing.id, quantity_kg });
        setCart(res.data);
        return { success: true };
      } else {
        // Guest cart
        const existingIdx = cart.items.findIndex(i => i.listing_id === listing.id);
        let updatedItems = [...cart.items];
        if (existingIdx >= 0) {
          updatedItems[existingIdx].quantity_kg += quantity_kg;
        } else {
          updatedItems.push({
            id: `temp_${Date.now()}`,
            listing_id: listing.id,
            quantity_kg,
            listing
          });
        }
        const total = updatedItems.reduce((acc, item) => acc + (item.listing.price_per_kg * item.quantity_kg), 0);
        const newCart = { items: updatedItems, total_amount: roundVal(total) };
        setCart(newCart);
        localStorage.setItem('agriconnect_guest_cart', JSON.stringify(newCart));
        return { success: true };
      }
    } catch (err) {
      const errorMsg = err.response?.data?.detail?.detail || "Could not add item to cart";
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId, newQty) => {
    if (newQty <= 0) return removeItem(itemId);
    if (isAuthenticated && role === 'customer') {
      try {
        const res = await cartAPI.updateItem(itemId, { quantity_kg: newQty });
        setCart(res.data);
      } catch (err) {
        console.error(err);
      }
    } else {
      const updated = cart.items.map(item => item.id === itemId ? { ...item, quantity_kg: newQty } : item);
      const total = updated.reduce((acc, item) => acc + (item.listing.price_per_kg * item.quantity_kg), 0);
      const newCart = { items: updated, total_amount: roundVal(total) };
      setCart(newCart);
      localStorage.setItem('agriconnect_guest_cart', JSON.stringify(newCart));
    }
  };

  const removeItem = async (itemId) => {
    if (isAuthenticated && role === 'customer') {
      try {
        const res = await cartAPI.removeItem(itemId);
        setCart(res.data);
      } catch (err) {
        console.error(err);
      }
    } else {
      const updated = cart.items.filter(item => item.id !== itemId);
      const total = updated.reduce((acc, item) => acc + (item.listing.price_per_kg * item.quantity_kg), 0);
      const newCart = { items: updated, total_amount: roundVal(total) };
      setCart(newCart);
      localStorage.setItem('agriconnect_guest_cart', JSON.stringify(newCart));
    }
  };

  const clearCart = async () => {
    if (isAuthenticated && role === 'customer') {
      try {
        await cartAPI.clearCart();
        setCart({ items: [], total_amount: 0.0 });
      } catch (err) {
        console.error(err);
      }
    } else {
      setCart({ items: [], total_amount: 0.0 });
      localStorage.removeItem('agriconnect_guest_cart');
    }
  };

  const itemCount = cart.items.reduce((acc, i) => acc + 1, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, updateQuantity, removeItem, clearCart, itemCount, loading, refreshCart: fetchCart }}>
      {children}
    </CartContext.Provider>
  );
};

const roundVal = (v) => Math.round(v * 100) / 100;

export const useCart = () => useContext(CartContext);
