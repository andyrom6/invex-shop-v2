"use client";

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle, Package, Truck, ArrowRight, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { getOrderByReference } from '@/lib/orders';
import { Order } from '@/lib/orders';
import { useCart } from '@/contexts/cart-context';

// Component to handle search params
function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const orderReference = searchParams.get('ref');
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { clearCart } = useCart();

  useEffect(() => {
    // Clear the cart when the success page loads
    clearCart();
    
    // Fetch order details if we have a reference
    if (orderReference) {
      fetchOrderDetails(orderReference);
    } else {
      setIsLoading(false);
    }
  }, [orderReference, clearCart]);

  async function fetchOrderDetails(reference: string) {
    try {
      setIsLoading(true);
      const orderData = await getOrderByReference(reference);
      setOrder(orderData);
    } catch (error) {
      console.error('Error fetching order details:', error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden"
        >
          {/* Success Header */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-8 py-12 text-white text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 100, delay: 0.1 }}
              className="mx-auto bg-white/20 w-20 h-20 rounded-full flex items-center justify-center backdrop-blur-sm mb-6"
            >
              <CheckCircle className="w-12 h-12" />
            </motion.div>
            <h1 className="text-3xl font-bold mb-2">Order Confirmed!</h1>
            <p className="text-white/80 max-w-md mx-auto">
              Thank you for your purchase. Your order has been received and is being processed.
            </p>
          </div>

          {/* Order Details */}
          <div className="px-8 py-10">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <motion.div
                  className="w-12 h-12 rounded-full border-4 border-emerald-600 border-t-transparent"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
              </div>
            ) : (
              <>
                <div className="mb-8">
                  <h2 className="text-xl font-semibold mb-4">Order Information</h2>
                  <div className="bg-gray-50 rounded-xl p-6 space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Order Reference:</span>
                      <span className="font-medium">{orderReference || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Date:</span>
                      <span>{order?.createdAt ? new Date(order.createdAt as Date).toLocaleDateString() : 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className="text-emerald-600 font-medium flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" /> 
                        {order?.status || 'Processing'}
                      </span>
                    </div>
                    {order && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total:</span>
                        <span className="font-bold">${order.totalAmount.toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {order && order.items && order.items.length > 0 && (
                  <div className="mb-8">
                    <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
                    <div className="space-y-4">
                      {order.items.map((item, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center gap-4 bg-gray-50 p-4 rounded-lg"
                        >
                          <div className="bg-white p-2 rounded-md">
                            <Package className="w-8 h-8 text-gray-400" />
                          </div>
                          <div className="flex-grow">
                            <h3 className="font-medium">{item.name}</h3>
                            <p className="text-sm text-gray-500">
                              {item.metadata.category} - {item.metadata.type}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">${item.price.toFixed(2)}</p>
                            <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* What's Next Section */}
                <div className="mb-8">
                  <h2 className="text-xl font-semibold mb-4">What's Next?</h2>
                  <div className="bg-blue-50 rounded-xl p-6 space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="bg-blue-100 p-2 rounded-full mt-1">
                        <Truck className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-blue-800">Shipping & Delivery</h3>
                        <p className="text-blue-700/80 text-sm mt-1">
                          Your order will be processed and shipped within 1-2 business days. 
                          You'll receive a shipping confirmation email with tracking information once your order ships.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-4">
                      <div className="bg-blue-100 p-2 rounded-full mt-1">
                        <ShoppingBag className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-blue-800">Order Tracking</h3>
                        <p className="text-blue-700/80 text-sm mt-1">
                          You can track your order status in the "Orders" section of your account dashboard.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
                  <Button asChild variant="outline" className="border-2">
                    <Link href="/orders">
                      View My Orders
                    </Link>
                  </Button>
                  <Button asChild className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    <Link href="/product" className="flex items-center gap-2">
                      Continue Shopping
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </Button>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// Loading fallback
function CheckoutSuccessLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-16 flex justify-center items-center">
      <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}

// Main component with Suspense boundary
export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<CheckoutSuccessLoading />}>
      <CheckoutSuccessContent />
    </Suspense>
  );
} 