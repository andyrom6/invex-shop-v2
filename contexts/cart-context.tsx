"use client"

import { createContext, useContext, useState, useEffect } from 'react'
import { CartItem } from '@/types/product'

interface CartContextType {
  items: CartItem[]
  itemCount: number
  showAnimation: boolean
  triggerAnimation: () => void
  refreshCart: () => Promise<void>
}

const CartContext = createContext<CartContextType>({
  items: [],
  itemCount: 0,
  showAnimation: false,
  triggerAnimation: () => {},
  refreshCart: async () => {},
})

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [showAnimation, setShowAnimation] = useState(false)

  useEffect(() => {
    refreshCart()
  }, [])

  async function refreshCart() {
    try {
      const response = await fetch('/api/cart')
      if (response.ok) {
        const data = await response.json()
        if (Array.isArray(data)) {
          setItems(data)
        }
      }
    } catch (error) {
      console.error('Error fetching cart:', error)
    }
  }

  const triggerAnimation = () => {
    setShowAnimation(true)
    setTimeout(() => setShowAnimation(false), 1000)
    refreshCart() // Refresh cart data
  }

  return (
    <CartContext.Provider 
      value={{ 
        items, 
        itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
        showAnimation,
        triggerAnimation,
        refreshCart
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)