"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowLeft, RefreshCw, ChevronDown, ChevronUp, ExternalLink, Search, Filter, Calendar, DollarSign, Package, User, X, Truck } from 'lucide-react';
import React from 'react';

// Define order status options
const ORDER_STATUSES = [
  { value: 'pending', label: 'Pending' },
  { value: 'processing', label: 'Processing' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' }
];

interface OrderItem {
  description: string;
  decodedName: string | null;
  quantity: number;
  amount: number;
}

interface StripeOrder {
  id: string;
  reference?: string;
  created?: number | string;
  date?: string;
  status?: string;
  amount_total: number;
  customer?: {
    name?: string;
    email?: string;
    phone?: string;
    address?: {
      line1: string;
      line2?: string;
      city: string;
      state: string;
      postal_code: string;
      country: string;
    }
  };
  items: OrderItem[];
  total_details?: {
    amount_discount: number;
  };
  promo_code?: string;
  trackingNumber?: string;
  trackingUrl?: string;
  carrier?: string;
}

// Helper function to format date and time
const formatDateTime = (timestamp: number | string): string => {
  let date;
  if (typeof timestamp === 'number') {
    date = new Date(timestamp * 1000);
  } else if (typeof timestamp === 'string') {
    date = new Date(timestamp);
  } else {
    return 'Invalid Date';
  }
  
  if (isNaN(date.getTime())) {
    return 'Invalid Date';
  }
  
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Helper function to format currency
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

const OrderCard = ({ order, onStatusChange }: { order: StripeOrder; onStatusChange: (orderId: string, status: string) => void }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatDate = (dateString: string | number | undefined) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Function to get status badge color
  const getStatusBadgeClass = (status: string = 'pending') => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-900/50';
      case 'shipped':
        return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-900/50';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-900/50';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-900/50';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-gray-100 dark:border-gray-700 transition-all hover:shadow-md">
      {/* Order Header */}
      <div className="p-5 border-b border-gray-100 dark:border-gray-700">
        <div className="flex justify-between items-center">
        <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{order.reference || order.id.substring(0, 12)}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {order.customer?.email || 'No email provided'}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {formatDate(order.date || order.created || '')}
            </p>
          </div>
          <div className="flex flex-col items-end">
            <div className="mb-2">
              <select
                value={order.status || 'pending'}
                onChange={(e) => onStatusChange(order.id, e.target.value)}
                className="px-3 py-1.5 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
              >
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(order.status)} border`}>
              {order.status || 'pending'}
            </span>
            <p className="text-sm font-medium text-gray-900 dark:text-white mt-2">
              {formatCurrency(order.amount_total)}
            </p>
          </div>
        </div>
      </div>

      {/* Tracking Information */}
      {order.status === 'shipped' && order.trackingNumber && (
        <div className="p-5 bg-blue-50 dark:bg-blue-900/20 border-t border-blue-100 dark:border-blue-900/30">
          <div className="flex items-start">
            <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-xl mr-3">
              <Truck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-grow">
              <h4 className="font-medium text-blue-900 dark:text-blue-300">Tracking Information</h4>
              <div className="flex flex-wrap gap-x-6 mt-1">
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  <span className="font-medium">Tracking Number:</span> {order.trackingNumber}
                </p>
                {order.carrier && (
                  <p className="text-sm text-blue-800 dark:text-blue-300">
                    <span className="font-medium">Carrier:</span> {order.carrier.toUpperCase()}
                  </p>
                )}
              </div>
              {order.trackingUrl && (
                <a 
                  href={order.trackingUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                >
                  Track Package
                  <ExternalLink className="w-3.5 h-3.5 ml-1" />
                </a>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Order Items Toggle */}
      <div className="px-5 py-3 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex justify-between items-center text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
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
        <div className="p-5 border-t border-gray-100 dark:border-gray-700">
          <div className="space-y-4">
            {order.items.map((item, index) => (
              <div key={index} className="flex items-center">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center overflow-hidden mr-4 flex-shrink-0">
                  <Package className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                </div>
                <div className="flex-grow">
                  <h4 className="font-medium text-gray-900 dark:text-white">{item.description}</h4>
                  {item.decodedName && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">Product: {item.decodedName}</p>
                  )}
                  <p className="text-sm text-gray-500 dark:text-gray-400">Qty: {item.quantity}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900 dark:text-white">{formatCurrency(item.amount)}</p>
                </div>
            </div>
          ))}
            
            <div className="pt-4 mt-4 border-t border-gray-100 dark:border-gray-700">
              <div className="flex justify-between font-medium text-gray-900 dark:text-white">
                <span>Total</span>
                <span>{formatCurrency(order.amount_total)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Stripe Link */}
      {order.id.startsWith('cs_') && (
        <div className="p-4 bg-gray-50 dark:bg-gray-700/30 border-t border-gray-100 dark:border-gray-700">
          <a 
            href={`https://dashboard.stripe.com/test/checkout/sessions/${order.id}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 flex items-center text-sm"
          >
            <ExternalLink className="w-4 h-4 mr-1" /> View in Stripe Dashboard
          </a>
        </div>
      )}
    </div>
  );
};

// Add a TrackingModal component
const TrackingModal = ({ 
  isOpen, 
  onClose, 
  onSubmit 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onSubmit: (trackingNumber: string, trackingUrl: string, carrier: string) => void;
}) => {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [trackingUrl, setTrackingUrl] = useState('');
  const [carrier, setCarrier] = useState('');
  const [error, setError] = useState('');
  const modalRef = useRef<HTMLDivElement>(null);

  // Define carriers with their tracking URL patterns
  const carriers = [
    { value: '', label: 'Select a carrier' },
    { value: 'usps', label: 'USPS', urlPattern: 'https://tools.usps.com/go/TrackConfirmAction?tLabels=' },
    { value: 'ups', label: 'UPS', urlPattern: 'https://www.ups.com/track?tracknum=' },
    { value: 'fedex', label: 'FedEx', urlPattern: 'https://www.fedex.com/fedextrack/?trknbr=' },
    { value: 'dhl', label: 'DHL', urlPattern: 'https://www.dhl.com/us-en/home/tracking.html?tracking-id=' },
    { value: 'other', label: 'Other (Manual URL)' }
  ];

  // Generate tracking URL based on carrier and tracking number
  useEffect(() => {
    if (carrier && trackingNumber && carrier !== 'other') {
      const selectedCarrier = carriers.find(c => c.value === carrier);
      if (selectedCarrier && selectedCarrier.urlPattern) {
        setTrackingUrl(selectedCarrier.urlPattern + trackingNumber);
      }
    }
  }, [carrier, trackingNumber]);

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!trackingNumber.trim()) {
      setError('Tracking number is required');
      return;
    }
    
    onSubmit(trackingNumber, trackingUrl, carrier);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div 
        ref={modalRef}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full p-6 animate-fadeIn border border-gray-100 dark:border-gray-700"
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
            <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-xl mr-3">
              <Truck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            Add Tracking Information
          </h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400 transition-colors rounded-full p-1 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-5">
            <label htmlFor="carrier" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Shipping Carrier <span className="text-red-500">*</span>
            </label>
            <select
              id="carrier"
              value={carrier}
              onChange={(e) => setCarrier(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm appearance-none"
              required
            >
              {carriers.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              Select the carrier to automatically generate a tracking URL
            </p>
          </div>
          
          <div className="mb-5">
            <label htmlFor="trackingNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tracking Number <span className="text-red-500">*</span>
            </label>
            <input
              id="trackingNumber"
              type="text"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder="Enter tracking number"
              className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
              required
            />
            {error && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>}
          </div>
          
          <div className={`mb-6 ${carrier === 'other' ? 'block' : 'hidden'}`}>
            <label htmlFor="trackingUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tracking URL {carrier === 'other' && <span className="text-red-500">*</span>}
            </label>
            <input
              id="trackingUrl"
              type="url"
              value={trackingUrl}
              onChange={(e) => setTrackingUrl(e.target.value)}
              placeholder="https://example.com/track/123456"
              className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
              required={carrier === 'other'}
            />
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              {carrier === 'other' 
                ? 'Enter the full URL where customers can track their package' 
                : 'URL will be automatically generated based on carrier and tracking number'}
            </p>
          </div>
          
          {carrier && carrier !== 'other' && trackingNumber && (
            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-700">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Preview:</p>
              <a 
                href={trackingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 break-all"
              >
                {trackingUrl}
              </a>
            </div>
          )}
          
          <div className="flex justify-end space-x-3 mt-8">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800 border border-transparent rounded-xl text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm transition-colors"
            >
              Save Tracking Info
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<StripeOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);
  const [currentStatus, setCurrentStatus] = useState<string | null>(null);

  async function fetchOrders() {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/stripe/orders?limit=50&status=paid');
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      const data = await response.json();
      setOrders(data.orders);
    } catch (error: any) {
      console.error('Error fetching orders:', error);
      setError(error.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  }

  // Function to update order status
  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      console.log(`Updating order ${orderId} status to ${status}`);
      
      // If status is shipped, open the tracking modal
      if (status === 'shipped') {
        setCurrentOrderId(orderId);
        setCurrentStatus(status);
        setIsTrackingModalOpen(true);
        return; // Don't proceed with the update yet
      }
      
      // For other statuses, proceed with the update
      const requestBody: any = { orderId, status };
      
      // If the orderId starts with 'cs_', it's a Stripe session ID
      if (orderId.startsWith('cs_')) {
        requestBody.sessionId = orderId;
      }
      
      const response = await fetch('/api/stripe/order/status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        alert('Order status updated successfully');
        
        // Update the local state immediately to reflect the change
        setOrders(prevOrders => 
          prevOrders.map(order => {
            if (order.id === orderId) {
              return {
                ...order,
                status
              };
            }
            return order;
          })
        );
        
        // Refresh orders after a short delay to ensure the server has processed the update
        setTimeout(() => {
          fetchOrders();
        }, 1000);
      } else {
        const errorData = await response.json();
        alert(`Failed to update order status: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('An error occurred while updating the order status');
    }
  };

  // Handle tracking information submission
  const handleTrackingSubmit = async (trackingNumber: string, trackingUrl: string, carrier: string) => {
    if (!currentOrderId || !currentStatus) return;
    
    try {
      const requestBody: any = { 
        orderId: currentOrderId, 
        status: currentStatus,
        trackingNumber,
        carrier
      };
      
      if (trackingUrl) {
        requestBody.trackingUrl = trackingUrl;
      }
      
      // If the orderId starts with 'cs_', it's a Stripe session ID
      if (currentOrderId.startsWith('cs_')) {
        requestBody.sessionId = currentOrderId;
      }
      
      const response = await fetch('/api/stripe/order/status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        alert('Order marked as shipped with tracking information');
        
        // Update the local state immediately to reflect the change
        setOrders(prevOrders => 
          prevOrders.map(order => {
            if (order.id === currentOrderId) {
              return {
                ...order,
                status: currentStatus,
                trackingNumber,
                trackingUrl,
                carrier
              };
            }
            return order;
          })
        );
        
        // Refresh orders after a short delay to ensure the server has processed the update
        setTimeout(() => {
          fetchOrders();
        }, 1000);
      } else {
        const errorData = await response.json();
        alert(`Failed to update order status: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error updating order status with tracking:', error);
      alert('An error occurred while updating the order status');
    } finally {
      setCurrentOrderId(null);
      setCurrentStatus(null);
    }
  };

  // Filter orders based on search term and status
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      searchTerm === '' || 
      (order.reference && order.reference.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (order.id && order.id.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (order.customer?.email && order.customer.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (order.customer?.name && order.customer.name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-3">
            <Link href="/admin" className="flex items-center justify-center h-10 w-10 rounded-xl bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-all border border-gray-100 dark:border-gray-700 text-indigo-600 dark:text-indigo-400">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Orders</h1>
          </div>
          
          <button 
            onClick={fetchOrders}
            className="flex items-center bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 px-5 py-2.5 rounded-xl hover:bg-indigo-50 dark:hover:bg-gray-700 transition-all shadow-sm hover:shadow-md border border-gray-100 dark:border-gray-700 font-medium"
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-8 mb-8 border border-gray-100 dark:border-gray-700 backdrop-blur-sm bg-opacity-90 dark:bg-opacity-90">
          <div className="flex items-center mb-6">
            <div className="bg-indigo-50 dark:bg-indigo-900/30 p-3 rounded-xl mr-4">
              <Package className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Orders Management</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Manage all your customer orders in one place</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-indigo-50 dark:bg-gray-700/50 rounded-xl p-5">
              <div className="flex items-start mb-3">
                <div className="flex-shrink-0 h-8 w-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center mr-3">
                  <span className="text-lg font-semibold text-indigo-600 dark:text-indigo-400">1</span>
                </div>
                <h3 className="font-medium text-gray-900 dark:text-white">View Orders</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Access customer information and items purchased</p>
            </div>
            
            <div className="bg-indigo-50 dark:bg-gray-700/50 rounded-xl p-5">
              <div className="flex items-start mb-3">
                <div className="flex-shrink-0 h-8 w-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center mr-3">
                  <span className="text-lg font-semibold text-indigo-600 dark:text-indigo-400">2</span>
                </div>
                <h3 className="font-medium text-gray-900 dark:text-white">Update Status</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Change order status from pending to delivered</p>
            </div>
            
            <div className="bg-indigo-50 dark:bg-gray-700/50 rounded-xl p-5">
              <div className="flex items-start mb-3">
                <div className="flex-shrink-0 h-8 w-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center mr-3">
                  <span className="text-lg font-semibold text-indigo-600 dark:text-indigo-400">3</span>
                </div>
                <h3 className="font-medium text-gray-900 dark:text-white">Track Payments</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Monitor payment status directly from Stripe</p>
            </div>
            
            <div className="bg-indigo-50 dark:bg-gray-700/50 rounded-xl p-5">
              <div className="flex items-start mb-3">
                <div className="flex-shrink-0 h-8 w-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center mr-3">
                  <span className="text-lg font-semibold text-indigo-600 dark:text-indigo-400">4</span>
                </div>
                <h3 className="font-medium text-gray-900 dark:text-white">Filter & Search</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Find orders by status or customer information</p>
            </div>
          </div>
        </div>
        
        {/* Search and Filter */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 mb-8 border border-gray-100 dark:border-gray-700">
          <div className="flex flex-col md:flex-row gap-5">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search by order ID, reference or customer email"
                className="block w-full pl-12 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="relative w-full md:w-64">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Filter className="h-5 w-5 text-gray-400" />
              </div>
              <select
                className="block w-full pl-12 pr-12 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-gray-100 appearance-none focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Statuses</option>
                {ORDER_STATUSES.map(status => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400">
                <ChevronDown className="w-5 h-5" />
              </div>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden border border-gray-100 dark:border-gray-700">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700/50">
                  <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    <div className="flex items-center">
                      <div className="bg-indigo-100 dark:bg-indigo-900/30 p-1.5 rounded-lg mr-2">
                        <Package className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      Order ID
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    <div className="flex items-center">
                      <div className="bg-indigo-100 dark:bg-indigo-900/30 p-1.5 rounded-lg mr-2">
                        <Calendar className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      Date & Time
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    <div className="flex items-center">
                      <div className="bg-indigo-100 dark:bg-indigo-900/30 p-1.5 rounded-lg mr-2">
                        <User className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      Customer
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    <div className="flex items-center">
                      <div className="bg-indigo-100 dark:bg-indigo-900/30 p-1.5 rounded-lg mr-2">
                        <DollarSign className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      Total
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 dark:border-indigo-400 mb-4"></div>
                        <p className="text-gray-500 dark:text-gray-400">Loading orders...</p>
                      </div>
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center">
                      <div className="bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 p-6 rounded-xl border border-red-100 dark:border-red-900/30 max-w-lg mx-auto">
                        <div className="flex items-center justify-center mb-3">
                          <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded-full">
                            <X className="w-6 h-6 text-red-600 dark:text-red-400" />
                          </div>
                        </div>
                        <p className="font-medium text-center">{error}</p>
                        <div className="flex justify-center mt-4">
                          <button 
                            onClick={fetchOrders}
                            className="px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                          >
                            Try again
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center">
                      {searchTerm || statusFilter !== 'all' ? (
                        <div className="max-w-lg mx-auto py-6 flex flex-col items-center">
                          <div className="bg-gray-100 dark:bg-gray-700/50 p-4 rounded-full mb-4">
                            <Search className="w-8 h-8 text-gray-400" />
                          </div>
                          <p className="font-medium text-gray-900 dark:text-white text-lg mb-1">No matching orders found</p>
                          <p className="text-gray-500 dark:text-gray-400">Try adjusting your search or filter criteria</p>
                        </div>
                      ) : (
                        <div className="max-w-lg mx-auto py-6 flex flex-col items-center">
                          <div className="bg-gray-100 dark:bg-gray-700/50 p-4 rounded-full mb-4">
                            <Package className="w-8 h-8 text-gray-400" />
                          </div>
                          <p className="font-medium text-gray-900 dark:text-white text-lg mb-1">No orders found</p>
                          <p className="text-gray-500 dark:text-gray-400">Orders will appear here once customers make purchases</p>
                        </div>
                      )}
                    </td>
                  </tr>
                ) : (
                    filteredOrders.map((order) => (
                    <React.Fragment key={order.id}>
                      <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                        <td className="px-6 py-5 whitespace-nowrap">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {order.reference || order.id.substring(0, 8)}...
                          </span>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap">
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {formatDateTime(order.date || order.created || '')}
                          </span>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap">
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {order.customer?.name || 'Guest'}
                            </span>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              {order.customer?.email || 'N/A'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap">
                          <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            order.status === 'delivered' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' :
                            order.status === 'shipped' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300' :
                            order.status === 'processing' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300' :
                            order.status === 'cancelled' ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300' :
                            'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                          }`}>
                            {order.status || 'pending'}
                          </span>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {formatCurrency(order.amount_total)}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex space-x-3">
                            <button
                              onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                              className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-indigo-600 dark:text-indigo-400 px-4 py-2 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors text-sm flex items-center font-medium shadow-sm"
                            >
                              {expandedOrder === order.id ? (
                                <>
                                  <ChevronUp className="w-4 h-4 mr-1.5" /> Hide
                                </>
                              ) : (
                                <>
                                  <ChevronDown className="w-4 h-4 mr-1.5" /> View
                                </>
                              )}
                            </button>
                            
                            <div className="relative">
                              <select
                                value={order.status || 'pending'}
                                onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-xl text-sm appearance-none cursor-pointer pr-9 hover:border-indigo-300 dark:hover:border-indigo-700 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm font-medium"
                              >
                                {ORDER_STATUSES.map(status => (
                                  <option key={status.value} value={status.value}>
                                    {status.label}
                                  </option>
                                ))}
                              </select>
                              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-gray-500 dark:text-gray-400">
                                <ChevronDown className="w-4 h-4" />
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                      
                      {/* Order details expanded view */}
                      {expandedOrder === order.id && (
                        <tr key={`expanded-${order.id}`}>
                          <td colSpan={6} className="px-6 py-4 bg-gray-50/70 dark:bg-gray-800/50">
                            <OrderCard order={order} onStatusChange={updateOrderStatus} />
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Tracking Modal */}
      <TrackingModal 
        isOpen={isTrackingModalOpen}
        onClose={() => setIsTrackingModalOpen(false)}
        onSubmit={handleTrackingSubmit}
      />
    </div>
  );
} 