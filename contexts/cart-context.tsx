"use client"

import { createContext, useContext, useState, useMemo, useEffect } from 'react'
import { Product } from '@/types/product'
import { toast } from 'react-hot-toast'

interface CartItem {
  id: string;
  name: string;
  price: number;
  currency: string;
  image: string;  // Single image for cart display
  metadata: Product['metadata'];
  quantity: number;
  onSale?: boolean;
  salePrice?: number;
  originalPrice?: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, quantity?: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  total: number;
  refreshCart: () => Promise<void>;
  itemCount: number;
  showAnimation: boolean;
}

const CartContext = createContext<CartContextType>({
  items: [],
  addItem: async () => {},
  removeItem: async () => {},
  updateQuantity: async () => {},
  clearCart: async () => {},
  total: 0,
  refreshCart: async () => {},
  itemCount: 0,
  showAnimation: false,
})

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [lastRefreshTime, setLastRefreshTime] = useState(0)
  const [showAnimation, setShowAnimation] = useState(false)
  
  // Calculate total item count
  const itemCount = useMemo(() => 
    items.reduce((count, item) => count + item.quantity, 0),
    [items]
  )
  
  // Load cart items on initial render
  useEffect(() => {
    const loadCart = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/cart');
        if (response.ok) {
          const data = await response.json();
          console.log('Initial cart data loaded:', data);
          setItems(data);
          setLastRefreshTime(Date.now());
        }
      } catch (error) {
        console.error('Error loading cart:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadCart();
  }, []);

  const addItem = async (product: Product, quantity = 1) => {
    // Update local state immediately
    setItems(current => {
      const existingItem = current.find(item => item.id === product.id)
      
      // Enhanced stock validation
      if (!product.stock || product.stock <= 0) {
        toast.error(`Sorry, ${product.name} is out of stock`)
        return current
      }
      
      if ((existingItem?.quantity || 0) + quantity > product.stock) {
        toast.error(`Only ${product.stock} units available. You already have ${existingItem?.quantity || 0} in your cart.`)
        return current
      }

      if (existingItem) {
        return current.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      }
      
      // Determine the price based on sale status
      const price = product.onSale && product.salePrice ? product.salePrice : product.price;
      const originalPrice = product.onSale && product.salePrice ? product.price : undefined;
      
      return [...current, {
        id: product.id,
        name: product.name,
        price: price,
        originalPrice: originalPrice,
        currency: product.currency,
        image: product.images[0],
        metadata: product.metadata,
        onSale: product.onSale || false,
        salePrice: product.salePrice,
        quantity
      }]
    })
    
    // Trigger animation
    setShowAnimation(true);
    setTimeout(() => {
      setShowAnimation(false);
    }, 1000);
    
    // Also update the server-side cart
    try {
      await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'add',
          item: {
            id: product.id,
            name: product.name,
            price: product.price,
            currency: product.currency,
            image: product.images[0] || '',
            quantity: quantity,
            onSale: product.onSale || false,
            salePrice: product.salePrice,
            metadata: {
              category: product.metadata.category || '',
              type: product.metadata.type || 'physical',
              delivery: product.metadata.delivery || 'shipping',
            }
          }
        }),
      });
    } catch (error) {
      console.error('Error updating server-side cart:', error);
    }
  }

  const removeItem = async (productId: string) => {
    // Update local state immediately
    setItems(current => current.filter(item => item.id !== productId))
    
    // Also update the cookie
    try {
      // Get current items after state update
      const updatedItems = items.filter(item => item.id !== productId);
      
      // Update the cookie directly
      await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'remove',
          item: { id: productId }
        }),
      });
    } catch (error) {
      console.error('Error updating cart cookie:', error);
    }
  }

  const updateQuantity = async (productId: string, quantity: number) => {
    // Validate quantity
    if (quantity < 1) {
      // If quantity is less than 1, remove the item
      return removeItem(productId);
    }
    
    // Check stock availability
    try {
      // Get the current product to check stock
      const response = await fetch(`/api/products/${productId}`);
      
      if (response.ok) {
        const product = await response.json();
        
        // Check if we have enough stock
        if (product.stock < quantity) {
          toast.error(`Sorry, only ${product.stock} units available`);
          
          // Update to maximum available instead
          if (product.stock > 0) {
            // Update local state with maximum available
            setItems(current =>
              current.map(item =>
                item.id === productId ? { ...item, quantity: product.stock } : item
              )
            );
            
            // Update server with maximum available
            await fetch('/api/cart', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                action: 'update-quantity',
                item: { id: productId, quantity: product.stock }
              }),
            });
            
            return;
          }
          
          return;
        }
      }
    } catch (error) {
      console.error('Error checking product stock:', error);
      // Continue with the update even if stock check fails
    }
    
    // Update local state
    setItems(current =>
      current.map(item =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
    
    // Update server
    try {
      await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'update-quantity',
          item: { id: productId, quantity }
        }),
      });
    } catch (error) {
      console.error('Error updating quantity on server:', error);
    }
  }

  const clearCart = async () => {
    // Clear local state first (this should always succeed)
    setItems([])
    
    // Clear server-side cart with error handling and timeout
    try {
      // Add a timeout to prevent hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout
      
      const response = await fetch('/api/cart/clear', {
        method: 'POST',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`Failed to clear cart: ${response.status}`);
      }
      
      // Return void to match the interface
      return;
    } catch (error) {
      console.error('Error clearing server-side cart:', error);
      // Don't throw the error - we've already cleared the local state
      // which is the most important part
      return;
    }
  }

  // Add total calculation
  const total = useMemo(() => 
    items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
    [items]
  )

  // Debounced refresh cart function
  const refreshCart = async () => {
    // Prevent excessive refreshes (minimum 1 second between refreshes)
    const now = Date.now();
    if (isLoading || (now - lastRefreshTime < 1000)) {
      console.log('Skipping refresh - too soon or already loading');
      return;
    }
    
    try {
      setIsLoading(true);
      const response = await fetch('/api/cart');
      if (response.ok) {
        const data = await response.json();
        setItems(data);
        setLastRefreshTime(now);
      }
    } catch (error) {
      console.error('Error refreshing cart:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <CartContext.Provider value={{ 
      items, 
      addItem, 
      removeItem, 
      updateQuantity, 
      clearCart,
      total,
      refreshCart,
      itemCount,
      showAnimation
    }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)