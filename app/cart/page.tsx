"use client"

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Button } from "@/components/ui/button"
import { Trash2, ShoppingBag, ArrowRight, Package, CreditCard, Shield, Truck, Plus, Minus, ChevronRight, X, Check } from "lucide-react"
import { toast } from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from "framer-motion"
import { useCart } from '@/contexts/cart-context'
import { CartItem } from '@/types/product'
import { logger } from '@/lib/logger'
import { isPhysicalProduct } from '@/lib/product-utils'
import { stripePromise } from '@/lib/stripe'

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
  isCheckingOut,
  currentStep
}: { 
  subtotal: number
  hasPhysicalItems: boolean
  currency: string
  onCheckout: () => void
  isCheckingOut: boolean
  currentStep: number
}) => {
  const shippingCost = hasPhysicalItems ? 12 : 0
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
            {subtotal === 0 && hasPhysicalItems && (
              <span className="text-xs text-emerald-600 font-medium ml-1">(discount will apply)</span>
            )}
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
                  {currentStep === 0 ? (
                    <>
                      <CreditCard className="h-5 w-5" />
                      Proceed to Checkout
                    </>
                  ) : (
                    <>
                      <Check className="h-5 w-5" />
                      Complete Order
                    </>
                  )}
                </>
              )}
            </span>
          </Button>
        </motion.div>

        <div className="space-y-3">
          {[
            { icon: Shield, text: "Secure Payment" },
            { icon: Package, text: hasPhysicalItems ? "Shipping: $12 Flat Rate" : "Digital Delivery" },
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

// New component for checkout steps
const CheckoutSteps = ({ currentStep, setCurrentStep }: { currentStep: number, setCurrentStep: (step: number) => void }) => {
  const steps = [
    { name: "Cart", icon: ShoppingBag },
    { name: "Payment", icon: CreditCard },
  ];

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={index} className="flex items-center">
            <motion.button
              onClick={() => index < currentStep && setCurrentStep(index)}
              className={`flex items-center justify-center w-10 h-10 rounded-full ${
                index <= currentStep 
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white" 
                  : "bg-gray-200 text-gray-500"
              } ${index < currentStep ? "cursor-pointer" : ""}`}
              whileHover={index < currentStep ? { scale: 1.1 } : {}}
              whileTap={index < currentStep ? { scale: 0.95 } : {}}
            >
              {index < currentStep ? (
                <Check className="h-5 w-5" />
              ) : (
                <step.icon className="h-5 w-5" />
              )}
            </motion.button>
            
            {index < steps.length - 1 && (
              <div className="w-full h-1 mx-2 bg-gray-200 relative">
                <motion.div 
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-600 to-purple-600"
                  initial={{ width: "0%" }}
                  animate={{ width: index < currentStep ? "100%" : "0%" }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            )}
            
            <span className={`hidden sm:block text-sm ${
              index <= currentStep ? "text-blue-600 font-medium" : "text-gray-500"
            }`}>
              {step.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Remove ShippingForm component and replace with StripeCheckoutPreview
const StripeCheckoutPreview = () => {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');

  const validateEmail = (email: string) => {
    if (!email) {
      setEmailError('Email is required');
      return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email address');
      return false;
    }
    
    setEmailError('');
    return true;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
      <h2 className="text-xl font-bold">Secure Checkout</h2>
      <p className="text-gray-600 mt-2 mb-6">
        Complete your order securely with Stripe.
      </p>
      
      <div className="mb-6">
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email Address <span className="text-red-500">*</span>
        </label>
        <input
          type="email"
          id="email"
          placeholder="Enter your email for order confirmation"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (emailError) validateEmail(e.target.value);
          }}
          onBlur={() => validateEmail(email)}
          required
        />
        {emailError && (
          <p className="mt-1 text-sm text-red-600">{emailError}</p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          We'll send your order confirmation and updates to this email address.
        </p>
      </div>
      
      <div className="bg-blue-50 rounded-lg p-4 mb-6">
        <p className="text-sm text-blue-700">
          You'll be redirected to Stripe's secure checkout page to complete your purchase.
        </p>
      </div>
      
      <div className="space-y-3 mb-6">
        <h3 className="font-medium text-gray-900">What to expect:</h3>
        {[
          { icon: Check, text: "Fast and secure checkout" },
          { icon: Check, text: "Order confirmation via email" },
          { icon: Check, text: "Instant access to digital products" },
        ].map((item, index) => (
          <div key={index} className="flex items-center">
            <div className="flex-shrink-0 w-5 h-5 text-green-500">
              <item.icon className="w-5 h-5" />
            </div>
            <p className="ml-2 text-sm text-gray-600">{item.text}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function CartPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  
  // Get cart items and functions from context
  const { 
    items: cartItems, 
    removeItem, 
    updateQuantity,
    clearCart,
    refreshCart,
    addItem
  } = useCart()

  const [removingItems, setRemovingItems] = useState<string[]>([])
  const [isCartLoaded, setIsCartLoaded] = useState(false)

  // Refresh cart data when component mounts
  useEffect(() => {
    // Only load cart data once
    if (isCartLoaded) return;
    
    const loadCartData = async () => {
      try {
        // First try to refresh from API
        await refreshCart();
        
        // Debug: Log cart items after refresh
        console.log('Cart items after refresh:', cartItems);
        
        // Check URL parameters for cart data as fallback
        if (window.location.search) {
          const urlParams = new URLSearchParams(window.location.search);
          const cartDataParam = urlParams.get('cartData');
          
          if (cartDataParam) {
            try {
              const parsedCartData = JSON.parse(cartDataParam);
              if (Array.isArray(parsedCartData) && parsedCartData.length > 0) {
                console.log('Using cart data from URL parameters:', parsedCartData);
                // Update cart items directly
                parsedCartData.forEach(item => {
                  // Add each item to cart
                  const product = {
                    id: item.id,
                    name: item.name,
                    price: item.price,
                    currency: item.currency,
                    images: [item.image],
                    metadata: item.metadata,
                    stock: 999, // Assume in stock
                    onSale: item.onSale,
                    salePrice: item.salePrice
                  } as any;
                  
                  // Add to cart
                  addItem(product, item.quantity);
                });
              }
            } catch (error) {
              console.error('Error parsing cart data from URL:', error);
            }
          }
        }
        
        // Mark cart as loaded to prevent further loading
        setIsCartLoaded(true);
      } catch (error) {
        console.error('Error loading cart data:', error);
        setIsCartLoaded(true); // Still mark as loaded to prevent infinite retries
      }
    };
    
    loadCartData();
  }, [refreshCart, addItem, removeItem, isCartLoaded]);

  // Log cart items whenever they change
  useEffect(() => {
    console.log('Cart items updated:', cartItems);
  }, [cartItems]);

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

    if (currentStep === 0) {
      setCurrentStep(1);
      return;
    }

    // Get email from the form
    const emailInput = document.getElementById('email') as HTMLInputElement;
    const email = emailInput?.value || '';
    
    // Log the email being sent
    logger.info(`Sending checkout request with email: ${email}`);
    
    // Validate email
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    try {
      setIsCheckingOut(true);
      const loadingToast = toast.loading('Preparing checkout...');

      // Create the request body with the email
      const requestBody = {
        items: cartItems.map(item => ({
          id: item.id,
          name: item.name,
          description: `${item.metadata.category} - ${item.metadata.type}`,
          price: item.price,
          currency: item.currency,
          images: [item.image],
          quantity: item.quantity,
        })),
        customerEmail: email,
        metadata: {
          cartId: Date.now().toString(),
        }
      };
      
      // Log the request body
      logger.info(`Checkout request body: ${JSON.stringify({ ...requestBody, customerEmail: email })}`);

      // Call our Stripe checkout API
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      
      toast.dismiss(loadingToast);
      
      // Check for error response
      if (!response.ok) {
        throw new Error(data.error || 'Checkout failed');
      }
      
      if (data.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Checkout failed. Please try again.');
    } finally {
      setIsCheckingOut(false);
    }
  }

  // Handle item removal
  const handleRemoveItem = async (itemId: string) => {
    try {
      // Set loading state for this specific item
      setRemovingItems(prev => [...prev, itemId]);
      
      // Use the optimized removeItem function from context
      await removeItem(itemId);
      toast.success('Item removed from cart');
    } catch (error) {
      console.error('Error removing item:', error);
      toast.error('Failed to remove item');
      // Refresh cart to restore state in case of error
      refreshCart();
    } finally {
      // Remove loading state
      setRemovingItems(prev => prev.filter(id => id !== itemId));
    }
  };

  // Handle quantity update
  const handleUpdateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    try {
      await updateQuantity(itemId, newQuantity);
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast.error('Failed to update quantity');
      refreshCart();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h1 
          className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {currentStep === 0 ? "Shopping Cart" : "Checkout"}
        </motion.h1>

        {currentStep > 0 && (
          <CheckoutSteps currentStep={currentStep} setCurrentStep={setCurrentStep} />
        )}

        {cartItems.length === 0 ? (
          <EmptyCart />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {currentStep === 0 && (
                <AnimatePresence mode="popLayout">
                  {cartItems.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ 
                        opacity: 0, 
                        x: -100,
                        transition: { duration: 0.3 }
                      }}
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
                          <motion.div>
                            {item.onSale && item.originalPrice ? (
                              <div className="flex items-baseline gap-2">
                                <motion.p 
                                  className="text-2xl font-bold text-red-600"
                                  whileHover={{ scale: 1.05 }}
                                >
                                  {new Intl.NumberFormat('en-US', {
                                    style: 'currency',
                                    currency: item.currency,
                                  }).format(item.price)}
                                </motion.p>
                                <span className="text-sm text-slate-500 line-through">
                                  {new Intl.NumberFormat('en-US', {
                                    style: 'currency',
                                    currency: item.currency,
                                  }).format(item.originalPrice)}
                                </span>
                              </div>
                            ) : (
                              <motion.p 
                                className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600"
                                whileHover={{ scale: 1.05 }}
                              >
                                {new Intl.NumberFormat('en-US', {
                                  style: 'currency',
                                  currency: item.currency,
                                }).format(item.price)}
                              </motion.p>
                            )}
                          </motion.div>
                          
                          {/* Quantity controls */}
                          <div className="flex items-center mt-2">
                            <span className="text-sm text-slate-600 mr-2">Quantity:</span>
                            <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-none"
                                onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                                disabled={item.quantity <= 1}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="w-8 text-center">{item.quantity}</span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-none"
                                onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                        <motion.div
                          whileHover={{ scale: 1.1, rotate: 10 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-500 hover:text-red-600 hover:bg-red-50 rounded-full"
                            onClick={() => handleRemoveItem(item.id)}
                            disabled={removingItems.includes(item.id)}
                          >
                            {removingItems.includes(item.id) ? (
                              <motion.div 
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                className="h-5 w-5"
                              >
                                ⟳
                              </motion.div>
                            ) : (
                              <X className="h-5 w-5" />
                            )}
                          </Button>
                        </motion.div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}

              {currentStep === 1 && (
                <StripeCheckoutPreview />
              )}
            </div>

            <CartSummary
              subtotal={subtotal}
              hasPhysicalItems={hasPhysicalItems}
              currency={cartItems[0]?.currency || 'USD'}
              onCheckout={handleCheckout}
              isCheckingOut={isCheckingOut}
              currentStep={currentStep}
            />
          </div>
        )}
      </div>
    </div>
  )
}