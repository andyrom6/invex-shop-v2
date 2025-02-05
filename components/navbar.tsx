"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useEffect, useState } from "react"
import { ArrowRightIcon } from '@heroicons/react/24/outline'
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion"
import { FaDiscord, FaTiktok } from 'react-icons/fa'
import { ShoppingBag, X, Tag } from "lucide-react"
import { SALE_ACTIVE, SALE_PERCENTAGE } from '@/lib/constants'
import { useCart } from '@/contexts/cart-context'
import Image from 'next/image'

const MiniCart = ({ items, onClose }: { 
  items: any[]
  onClose: () => void 
}) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 10 }}
    className="absolute top-full right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 z-50"
  >
    <div className="p-4 max-h-96 overflow-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg">Shopping Cart</h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="hover:bg-gray-100 rounded-full"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      {items.length === 0 ? (
        <div className="text-center py-8">
          <ShoppingBag className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Your cart is empty</p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {items.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <div className="relative h-16 w-16 rounded-md overflow-hidden bg-gray-100">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {item.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    Qty: {item.quantity}
                  </p>
                  <p className="text-sm font-medium text-blue-600">
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: item.currency,
                    }).format(item.price)}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
          
          <div className="mt-4 pt-4 border-t">
            <div className="flex justify-between mb-4">
              <span className="font-medium">Total</span>
              <span className="font-bold text-blue-600">
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: items[0]?.currency || 'USD',
                }).format(
                  items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
                )}
              </span>
            </div>
            <Button 
              asChild
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white relative overflow-hidden"
            >
              <Link href="/cart">
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
                <span className="relative z-10">View Cart</span>
              </Link>
            </Button>
          </div>
        </>
      )}
    </div>
  </motion.div>
)

export default function Navbar() {
  const { items, itemCount, showAnimation } = useCart()
  const [mounted, setMounted] = useState(false)
  const [showMiniCart, setShowMiniCart] = useState(false)
  const [isHovering, setIsHovering] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)
  const { scrollY } = useScroll()

  useMotionValueEvent(scrollY, "change", (latest) => {
    const currentScrollY = latest
    const isScrollingDown = currentScrollY > lastScrollY
    const scrollDifference = Math.abs(currentScrollY - lastScrollY)

    // Only trigger hide/show for significant scroll amounts
    if (scrollDifference > 10) {
      setIsVisible(!isScrollingDown || currentScrollY < 50)
    }

    setLastScrollY(currentScrollY)
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    let timeout: NodeJS.Timeout
    if (!isHovering && showMiniCart) {
      timeout = setTimeout(() => setShowMiniCart(false), 300)
    }
    return () => clearTimeout(timeout)
  }, [isHovering, showMiniCart])

  if (!mounted) return null

  return (
    <motion.header
      initial={{ y: 0 }}
      animate={{ 
        y: isVisible ? 0 : -100,
        opacity: isVisible ? 1 : 0
      }}
      transition={{ 
        duration: 0.3,
        ease: "easeInOut"
      }}
      className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b shadow-sm"
    >
      <div className="relative px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between w-full max-w-7xl mx-auto">
        <div className="flex items-center">
          <Link href="/" className="text-2xl font-bold">
            InvexShop
          </Link>
        </div>

        <div className="flex items-center">
          <div 
            className="relative"
            onMouseEnter={() => {
              setIsHovering(true)
              setShowMiniCart(true)
            }}
            onMouseLeave={() => setIsHovering(false)}
          >
            <Button
              variant="ghost"
              size="icon"
              className="relative group"
              asChild
            >
              <Link href="/cart">
                <AnimatePresence>
                  {showAnimation && (
                    <motion.div
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.5, opacity: 0 }}
                      className="absolute -top-1 -right-1 w-full h-full bg-blue-500/20 rounded-full"
                      style={{ padding: '20px' }}
                    />
                  )}
                </AnimatePresence>
                <motion.div
                  animate={showAnimation ? {
                    scale: [1, 1.2, 1],
                    rotate: [0, 15, -15, 0],
                  } : {}}
                  transition={{ duration: 0.5 }}
                  className="relative"
                >
                  <ShoppingBag className="h-6 w-6 text-gray-700 group-hover:text-blue-600 transition-colors" />
                  {itemCount > 0 && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-2 -right-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
                    >
                      {itemCount}
                    </motion.div>
                  )}
                </motion.div>
              </Link>
            </Button>

            <AnimatePresence>
              {showMiniCart && (
                <MiniCart 
                  items={items} 
                  onClose={() => setShowMiniCart(false)} 
                />
              )}
            </AnimatePresence>
          </div>

          <div className="flex items-center space-x-4 ml-4">
            <Link 
              href="https://discord.gg/WUGBwGbpfF" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              <Button variant="ghost" size="icon">
                <FaDiscord className="h-5 w-5" />
              </Button>
            </Link>
            <Link 
              href="https://www.tiktok.com/@invex.resells" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              <Button variant="ghost" size="icon">
                <FaTiktok className="h-5 w-5" />
              </Button>
            </Link>
            
            <Link href="https://invex-pro-web.vercel.app/" target="_blank" rel="noopener noreferrer">
              <Button 
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0"
              >
                Login to InvexPro
                <ArrowRightIcon className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </motion.header>
  )
}