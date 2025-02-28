import { NextRequest, NextResponse } from 'next/server';
import { getOrders } from '@/lib/orders';
import { logger } from '@/lib/logger';
import { Timestamp } from 'firebase/firestore';

export async function POST(request: NextRequest) {
  try {
    const { email, orderReference } = await request.json();
    
    // Check if at least one parameter is provided
    if (!email && !orderReference) {
      return NextResponse.json(
        { error: 'Either email or orderReference must be provided' },
        { status: 400 }
      );
    }
    
    // Get all orders
    const orders = await getOrders();
    
    // Filter orders based on provided parameters
    const filteredOrders = orders.filter(order => {
      if (email && order.customerEmail && order.customerEmail.toLowerCase() === email.toLowerCase()) {
        return true;
      }
      if (orderReference && order.orderReference === orderReference) {
        return true;
      }
      return false;
    });
    
    // Map orders to a simpler format for the client
    const mappedOrders = filteredOrders.map(order => {
      // Handle date conversion properly
      let createdAtString: string;
      if (order.createdAt) {
        if (order.createdAt instanceof Timestamp) {
          // It's a Firestore Timestamp
          createdAtString = order.createdAt.toDate().toISOString();
        } else if (order.createdAt instanceof Date) {
          // It's a JavaScript Date
          createdAtString = order.createdAt.toISOString();
        } else {
          // Fallback
          createdAtString = new Date().toISOString();
        }
      } else {
        createdAtString = new Date().toISOString();
      }

      return {
        id: order.id,
        reference: order.orderReference,
        status: order.status,
        total: order.totalAmount,
        createdAt: createdAtString,
        items: order.items.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image || undefined
        })),
        trackingNumber: order.trackingNumber,
        trackingUrl: order.trackingUrl
      };
    });
    
    return NextResponse.json({
      success: true,
      orders: mappedOrders
    });
  } catch (error) {
    logger.error('Error looking up orders:', error);
    return NextResponse.json(
      { error: 'Failed to look up orders', details: (error as Error).message },
      { status: 500 }
    );
  }
} 