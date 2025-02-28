'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getOrderById, decodeProductName, Order } from '@/lib/orders';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function OrderDetailsPage() {
  const { id } = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrder() {
      try {
        if (typeof id !== 'string') return;
        
        setLoading(true);
        const orderData = await getOrderById(id);
        setOrder(orderData);
      } catch (error) {
        console.error('Error fetching order:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchOrder();
  }, [id]);

  // Function to decode Stripe product names
  const getDecodedProductName = (encodedName: string, order: Order) => {
    return decodeProductName(encodedName, order);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold text-red-700 mb-2">Order Not Found</h2>
          <p className="text-red-600 mb-4">The order you're looking for doesn't exist or has been removed.</p>
          <Link href="/admin/orders" className="inline-flex items-center text-blue-600 hover:underline">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/admin/orders" className="inline-flex items-center text-blue-600 hover:underline">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Orders
        </Link>
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-blue-600 text-white px-6 py-4">
          <h1 className="text-xl font-semibold">Order Details</h1>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h2 className="text-lg font-medium mb-3">Order Information</h2>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Order ID:</span>
                  <span className="font-medium">{order.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Reference:</span>
                  <span className="font-medium">{order.orderReference}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date:</span>
                  <span>{new Date(order.createdAt as Date).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className={`font-medium ${
                    order.status === 'delivered' ? 'text-green-600' :
                    order.status === 'processing' ? 'text-blue-600' :
                    order.status === 'shipped' ? 'text-purple-600' :
                    order.status === 'cancelled' ? 'text-red-600' :
                    'text-yellow-600'
                  }`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total:</span>
                  <span className="font-bold">${order.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h2 className="text-lg font-medium mb-3">Customer Information</h2>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Email:</span>
                  <span>{order.customerEmail || 'N/A'}</span>
                </div>
                {order.shippingAddress ? (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Name:</span>
                      <span>{order.shippingAddress.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Address:</span>
                      <span>{order.shippingAddress.address}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">City:</span>
                      <span>{order.shippingAddress.city}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">State/Zip:</span>
                      <span>{order.shippingAddress.state}, {order.shippingAddress.zip}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Country:</span>
                      <span>{order.shippingAddress.country}</span>
                    </div>
                  </>
                ) : (
                  <div className="text-gray-500 italic">No shipping address provided</div>
                )}
              </div>
            </div>
          </div>
          
          <h2 className="text-lg font-medium mb-3">Order Items</h2>
          <div className="bg-gray-50 rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer-Facing Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reference Code
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actual Product
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {order.items.map((item, index) => {
                  const encodedName = item.metadata?.encodedName || '';
                  const refCode = item.metadata?.refCode || '';
                  return (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {item.image ? (
                            <img src={item.image} alt={item.name} className="h-10 w-10 rounded-full mr-3 object-cover" />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gray-200 mr-3 flex items-center justify-center text-gray-500">
                              No img
                            </div>
                          )}
                          <div className="text-sm font-medium text-gray-900">{item.name}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {encodedName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {refCode}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                        {getDecodedProductName(encodedName, order)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${item.price.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        ${(item.price * item.quantity).toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {order.productMapping && (
            <div className="mt-6">
              <h2 className="text-lg font-medium mb-3">Product Mapping (Debug)</h2>
              <div className="bg-gray-50 rounded-lg p-4">
                <pre className="text-xs overflow-auto max-h-60">
                  {JSON.stringify(order.productMapping, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 