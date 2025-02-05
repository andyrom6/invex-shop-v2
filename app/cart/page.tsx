"use client"

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Button } from "@/components/ui/button"
import { Trash2, ShoppingBag, ArrowRight, Package, CreditCard, Shield, Truck } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from "framer-motion"
import { loadStripe } from '@stripe/stripe-js'
import { useCart } from '@/contexts/cart-context'
import { CartItem } from '@/types/product'
import { logger } from '@/lib/logger'
import { isPhysicalProduct } from '@/lib/product-utils'

const EmptyCart = () => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="text-center py-16"
  >
    <motion.div
      initial={{ scale: 0.5 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 100 }}
    >
      <ShoppingBag className="mx-auto h-24 w-24 text-slate-200 mb-6" />
    </motion.div>
    <h2 className="text-2xl font-bold text-slate-900 mb-4">Your cart is empty</h2>
    <p className="text-slate-600 mb-8">Looks like you have not added any items yet.</p>
    <Button 
      asChild
      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-6 rounded-xl text-lg"
    >
      <motion.a 
        href="/product"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="inline-flex items-center"
      >
        Start Shopping
        <ArrowRight className="ml-2 h-5 w-5" />
      </motion.a>
    </Button>
  </motion.div>
)

const CartSummary = ({ 
  subtotal, 
  hasPhysicalItems,
  currency, 
  onCheckout, 
  isCheckingOut 
}: { 
  subtotal: number
  hasPhysicalItems: boolean
  currency: string
  onCheckout: () => void
  isCheckingOut: boolean 
}) => {
  const shippingCost = hasPhysicalItems ? 15 : 0
  const total = subtotal + shippingCost

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-white rounded-2xl p-6 shadow-lg sticky top-24"
    >
      <h2 className="text-2xl font-bold mb-6">Order Summary</h2>
      
      <div className="space-y-4 mb-6">
        <div className="flex justify-between text-slate-600">
          <span>Subtotal</span>
          <span>{new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency,
          }).format(subtotal)}</span>
        </div>

        <div className="flex justify-between text-slate-600">
          <span className="flex items-center gap-2">
            <Truck className="h-4 w-4" />
            Shipping
          </span>
          {hasPhysicalItems ? (
            <span>{new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: currency,
            }).format(shippingCost)}</span>
          ) : (
            <span className="text-emerald-600">Free</span>
          )}
        </div>

        <div className="border-t pt-4">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold">Total</span>
            <motion.span 
              className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600"
              whileHover={{ scale: 1.1 }}
            >
              {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: currency,
              }).format(total)}
            </motion.span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button 
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-6 text-lg rounded-xl relative overflow-hidden"
            onClick={onCheckout}
            disabled={isCheckingOut}
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              animate={{
                x: ['-200%', '200%'],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "linear",
              }}
            />
            <span className="relative z-10 flex items-center justify-center gap-2">
              {isCheckingOut ? (
                <>Processing...</>
              ) : (
                <>
                  <CreditCard className="h-5 w-5" />
                  Checkout
                </>
              )}
            </span>
          </Button>
        </motion.div>

        <div className="space-y-3">
          {[
            { icon: Shield, text: "Secure Payment" },
            { icon: Package, text: hasPhysicalItems ? "Shipping: $15 Flat Rate" : "Digital Delivery" },
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-2 text-sm text-slate-600"
            >
              <feature.icon className="h-4 w-4 text-blue-600" />
              <span>{feature.text}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

export default function CartPage() {
  const { items: cartItems, refreshCart } = useCart()
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const router = useRouter()

  const hasPhysicalItems = cartItems.some(item => 
    isPhysicalProduct(item.metadata)
  )

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  )

  async function handleCheckout() {
    if (cartItems.length === 0) {
      logger.warn('Attempted checkout with empty cart')
      toast.error('Your cart is empty')
      return
    }

    setIsCheckingOut(true)
    const checkoutTimer = logger.time('Client Checkout Process')
    
    try {
      logger.info('Starting checkout process', {
        itemCount: cartItems.length,
        total: subtotal
      })

      // Pre-load Stripe
      logger.info('Loading Stripe...')
      const [stripe] = await Promise.all([
        loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!),
        new Promise(resolve => setTimeout(resolve, 100))
      ])

      if (!stripe) {
        throw new Error('Failed to load Stripe')
      }
      logger.success('Stripe loaded successfully')

      // Format items for checkout
      logger.info('Formatting line items...')
      const items = cartItems.map(item => ({
        price_data: {
          currency: item.currency.toLowerCase(),
          product_data: {
            name: item.name,
            images: [item.image],
            metadata: item.metadata || {}
          },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity
      }))
      logger.success('Line items formatted', { itemCount: items.length })

      // Create checkout session
      logger.info('Creating checkout session...')
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create checkout session')
      }

      const { sessionId } = await response.json()
      logger.success('Checkout session created', { sessionId })
      
      // Redirect to Stripe checkout
      logger.info('Redirecting to Stripe checkout...')
      const { error } = await stripe.redirectToCheckout({ sessionId })
      if (error) throw error

      logger.success('Redirected to Stripe checkout')
      checkoutTimer()
    } catch (error: any) {
      logger.error('Checkout failed', error)
      checkoutTimer()
      toast.error(error.message || 'Failed to proceed to checkout')
    } finally {
      setIsCheckingOut(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h1 
          className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Shopping Cart
        </motion.h1>

        {cartItems.length === 0 ? (
          <EmptyCart />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <AnimatePresence mode="popLayout">
                {cartItems.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="bg-white rounded-2xl p-6 shadow-lg"
                  >
                    <div className="flex items-center gap-6">
                      <motion.div 
                        className="relative h-24 w-24 flex-shrink-0"
                        whileHover={{ scale: 1.05 }}
                      >
                        <Image
                          src={item.image}
                          alt={item.name}
                          className="object-cover object-center rounded-xl"
                          fill
                          sizes="96px"
                        />
                      </motion.div>
                      <div className="flex-grow">
                        <motion.h3 
                          className="font-semibold text-lg"
                          whileHover={{ x: 5 }}
                        >
                          {item.name}
                        </motion.h3>
                        <motion.p 
                          className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600"
                          whileHover={{ scale: 1.05 }}
                        >
                          {new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: item.currency,
                          }).format(item.price)}
                        </motion.p>
                        <p className="text-sm text-slate-600">
                          Quantity: {item.quantity}
                        </p>
                      </div>
                      <motion.div
                        whileHover={{ scale: 1.1, rotate: 10 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:text-red-600 hover:bg-red-50"
                          onClick={async () => {
                            try {
                              const response = await fetch('/api/cart', {
                                method: 'POST',
                                headers: {
                                  'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({
                                  action: 'remove',
                                  item: { id: item.id }
                                }),
                              })

                              if (!response.ok) {
                                throw new Error('Failed to remove item')
                              }

                              await refreshCart()
                              toast.success('Item removed from cart')
                            } catch (error) {
                              console.error('Error removing item:', error)
                              toast.error('Failed to remove item')
                            }
                          }}
                        >
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      </motion.div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <CartSummary
              subtotal={subtotal}
              hasPhysicalItems={hasPhysicalItems}
              currency={cartItems[0]?.currency || 'USD'}
              onCheckout={handleCheckout}
              isCheckingOut={isCheckingOut}
            />
          </div>
        )}
      </div>
    </div>
  )
}