'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';

interface Order {
  id: string;
  reference: string;
  status: string;
  total: number;
  createdAt: string;
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
  }>;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect if not authenticated
    if (!isAuthenticated && !loading) {
      router.push('/');
      return;
    }

    // Fetch orders if authenticated
    if (isAuthenticated) {
      fetchOrders();
    }
  }, [isAuthenticated, router]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      // This would be replaced with an actual API call to fetch orders
      // For now, we'll just simulate a delay and return empty orders
      await new Promise(resolve => setTimeout(resolve, 500));
      setOrders([]);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Your Orders</h1>
        <div className="flex justify-center items-center h-64">
          <p>Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Your Orders</h1>
      
      {orders.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-600">You haven't placed any orders yet.</p>
          <button 
            onClick={() => router.push('/')}
            className="mt-4 bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition"
          >
            Continue Shopping
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Order #{order.reference}</h2>
                <span className={`px-3 py-1 rounded-full text-sm ${
                  order.status === 'completed' ? 'bg-green-100 text-green-800' :
                  order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Placed on {new Date(order.createdAt).toLocaleDateString()}
              </p>
              <div className="border-t border-gray-200 pt-4">
                <p className="font-medium">Items:</p>
                <ul className="mt-2 space-y-2">
                  {order.items.map((item) => (
                    <li key={item.id} className="flex justify-between">
                      <span>{item.name} x{item.quantity}</span>
                      <span>${(item.price * item.quantity).toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between font-semibold">
                  <span>Total</span>
                  <span>${order.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 