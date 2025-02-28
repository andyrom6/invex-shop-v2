'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { ArrowLeft, Search, Package, Truck, CheckCircle, ExternalLink, ChevronUp, ChevronDown } from 'lucide-react';
import Link from 'next/link';

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  image?: string;
  variant?: string;
}

interface Order {
  id: string;
  reference: string;
  status: string;
  total: number;
  createdAt: string;
  items: OrderItem[];
  trackingNumber?: string;
  trackingUrl?: string;
  carrier?: string;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [orderReference, setOrderReference] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Check if we have query parameters
    const ref = searchParams.get('ref');
    const emailParam = searchParams.get('email');
    
    if (ref) {
      setOrderReference(ref);
    }
    
    if (emailParam) {
      setEmail(emailParam);
    }
    
    // If we have either parameter, perform the search automatically
    if (ref || emailParam) {
      lookupOrders(emailParam || '', ref || '');
    } else if (isAuthenticated && user?.email) {
      // If user is authenticated, fetch their orders
      setEmail(user.email);
      lookupOrders(user.email, '');
    }
  }, [searchParams, isAuthenticated, user]);

  const lookupOrders = async (emailValue: string, referenceValue: string) => {
    if (!emailValue && !referenceValue) {
      setError('Please enter either your email or order reference number');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      setHasSearched(true);
      
      const response = await fetch('/api/orders/lookup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: emailValue,
          orderReference: referenceValue,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to lookup orders');
      }
      
      const data = await response.json();
      
      if (data.success && data.orders) {
        setOrders(data.orders);
        setError('');
      } else {
        setOrders([]);
        setError(data.error || 'No orders found');
      }
    } catch (error: any) {
      console.error('Error looking up orders:', error);
      setError(error.message || 'An error occurred while looking up your orders');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    lookupOrders(email, orderReference);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const OrderCard = ({ order }: { order: Order }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    // Function to get status badge color
    const getStatusBadgeClass = (status: string) => {
      switch (status) {
        case 'delivered':
          return 'bg-green-100 text-green-800 border-green-200';
        case 'shipped':
          return 'bg-blue-100 text-blue-800 border-blue-200';
        case 'processing':
          return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        case 'cancelled':
          return 'bg-red-100 text-red-800 border-red-200';
        default:
          return 'bg-gray-100 text-gray-800 border-gray-200';
      }
    };

    return (
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 transition-all hover:shadow-md">
        {/* Order Header */}
        <div className="p-5 border-b border-gray-100">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Order #{order.reference}</h3>
              <p className="text-sm text-gray-500 mt-1">{formatDate(order.createdAt)}</p>
            </div>
            <div className="flex flex-col items-end">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(order.status)} border`}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </span>
              <p className="text-sm font-medium text-gray-900 mt-2">${order.total.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Order Progress - Only show for non-cancelled orders */}
        {order.status !== 'cancelled' && (
          <div className="px-5 py-4 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  order.status === 'pending' || order.status === 'processing' || order.status === 'shipped' || order.status === 'delivered' 
                    ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-400'
                }`}>
                  <CheckCircle className="w-4 h-4" />
                </div>
                <span className="text-xs mt-1">Confirmed</span>
              </div>
              <div className="h-1 flex-grow mx-2 bg-gray-200">
                <div className={`h-full ${
                  order.status === 'processing' || order.status === 'shipped' || order.status === 'delivered' 
                    ? 'bg-indigo-500' : 'bg-gray-200'
                }`}></div>
              </div>
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  order.status === 'processing' || order.status === 'shipped' || order.status === 'delivered' 
                    ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-400'
                }`}>
                  <Package className="w-4 h-4" />
                </div>
                <span className="text-xs mt-1">Processing</span>
              </div>
              <div className="h-1 flex-grow mx-2 bg-gray-200">
                <div className={`h-full ${
                  order.status === 'shipped' || order.status === 'delivered' 
                    ? 'bg-indigo-500' : 'bg-gray-200'
                }`}></div>
              </div>
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  order.status === 'shipped' || order.status === 'delivered' 
                    ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-400'
                }`}>
                  <Truck className="w-4 h-4" />
                </div>
                <span className="text-xs mt-1">Shipped</span>
              </div>
              <div className="h-1 flex-grow mx-2 bg-gray-200">
                <div className={`h-full ${
                  order.status === 'delivered' 
                    ? 'bg-indigo-500' : 'bg-gray-200'
                }`}></div>
              </div>
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  order.status === 'delivered' 
                    ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-400'
                }`}>
                  <CheckCircle className="w-4 h-4" />
                </div>
                <span className="text-xs mt-1">Delivered</span>
              </div>
            </div>
          </div>
        )}

        {/* Tracking Information */}
        {order.status === 'shipped' && order.trackingNumber && (
          <div className="p-5 bg-blue-50 border-t border-blue-100">
            <div className="flex items-start">
              <div className="bg-blue-100 p-2 rounded-full mr-3">
                <Truck className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-grow">
                <h4 className="font-medium text-blue-900">Tracking Information</h4>
                <div className="flex flex-wrap gap-x-6 mt-1">
                  <p className="text-sm text-blue-800">
                    <span className="font-medium">Tracking Number:</span> {order.trackingNumber}
                  </p>
                  {order.carrier && (
                    <p className="text-sm text-blue-800">
                      <span className="font-medium">Carrier:</span> {order.carrier.toUpperCase()}
                    </p>
                  )}
                </div>
                
                {order.trackingUrl && (
                  <div className="mt-3">
                    <a 
                      href={order.trackingUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Track Your Package
                      <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
                    </a>
                  </div>
                )}
                
                {!order.trackingUrl && order.trackingNumber && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <a 
                      href={`https://tools.usps.com/go/TrackConfirmAction?tLabels=${order.trackingNumber}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-3 py-1.5 bg-blue-100 text-blue-800 text-xs font-medium rounded-md hover:bg-blue-200 transition-colors"
                    >
                      Track with USPS
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </a>
                    <a 
                      href={`https://www.ups.com/track?tracknum=${order.trackingNumber}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-3 py-1.5 bg-blue-100 text-blue-800 text-xs font-medium rounded-md hover:bg-blue-200 transition-colors"
                    >
                      Track with UPS
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </a>
                    <a 
                      href={`https://www.fedex.com/fedextrack/?trknbr=${order.trackingNumber}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-3 py-1.5 bg-blue-100 text-blue-800 text-xs font-medium rounded-md hover:bg-blue-200 transition-colors"
                    >
                      Track with FedEx
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Order Items Toggle */}
        <div className="px-5 py-3 border-t border-gray-100 bg-gray-50">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full flex justify-between items-center text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors"
          >
            <span>Order Items ({order.items.reduce((sum, item) => sum + item.quantity, 0)})</span>
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Order Items */}
        {isExpanded && (
          <div className="p-5 border-t border-gray-100">
            <div className="space-y-4">
              {order.items.map((item, index) => (
                <div key={index} className="flex items-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden mr-4 flex-shrink-0">
                    {item.image ? (
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Package className="w-8 h-8 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-grow">
                    <h4 className="font-medium text-gray-900">{item.name}</h4>
                    {item.variant && (
                      <p className="text-sm text-gray-500">Variant: {item.variant}</p>
                    )}
                    <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">${(item.price * item.quantity).toFixed(2)}</p>
                    <p className="text-xs text-gray-500">${item.price.toFixed(2)} each</p>
                  </div>
                </div>
              ))}
              
              <div className="pt-4 mt-4 border-t border-gray-100">
                <div className="flex justify-between font-medium text-gray-900">
                  <span>Total</span>
                  <span>${order.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center">
          <Link href="/" className="text-indigo-600 hover:text-indigo-800 mr-4 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Order Lookup</h1>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Find Your Orders</h2>
          <p className="text-gray-600 mb-6">
            Enter your email address or order reference number to find your orders.
          </p>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                placeholder="Enter the email used for your order"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            <div className="flex items-center">
              <div className="flex-grow border-t border-gray-200"></div>
              <span className="flex-shrink-0 px-3 text-gray-500 text-sm">OR</span>
              <div className="flex-grow border-t border-gray-200"></div>
            </div>
            
            <div>
              <label htmlFor="orderReference" className="block text-sm font-medium text-gray-700 mb-1">
                Order Reference Number
              </label>
              <input
                type="text"
                id="orderReference"
                placeholder="e.g. order_1234567890"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                value={orderReference}
                onChange={(e) => setOrderReference(e.target.value)}
              />
            </div>
            
            {error && (
              <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">
                {error}
              </div>
            )}
            
            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  Looking up orders...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  Find Orders
                </>
              )}
            </button>
          </form>
        </div>
        
        {hasSearched && !loading && (
          <>
            {orders.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                  <Package className="w-8 h-8 text-gray-400" />
                </div>
                <h2 className="text-xl font-semibold mb-2">No Orders Found</h2>
                <p className="text-gray-600 mb-6">
                  We couldn't find any orders matching your search criteria.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/product" className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
                    Browse Products
                  </Link>
                  <button 
                    onClick={() => {
                      setEmail('');
                      setOrderReference('');
                      setHasSearched(false);
                    }}
                    className="bg-white border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Try Different Search
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold">Your Orders ({orders.length})</h2>
                
                {orders.map((order) => (
                  <OrderCard key={order.id} order={order} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
} 