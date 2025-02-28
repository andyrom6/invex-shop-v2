import { NextRequest, NextResponse } from 'next/server';
import { fetchAndDecodeStripeOrder } from '@/lib/orders';
import { logger } from '@/lib/logger';

export async function GET(req: NextRequest) {
  try {
    // Get the session ID from the query parameters
    const url = new URL(req.url);
    const sessionId = url.searchParams.get('session_id');
    
    if (!sessionId) {
      return NextResponse.json(
        { error: 'Missing session_id parameter' },
        { status: 400 }
      );
    }
    
    // Fetch and decode the order
    const result = await fetchAndDecodeStripeOrder(sessionId);
    
    if (!result) {
      return NextResponse.json(
        { error: 'Order not found or could not be decoded' },
        { status: 404 }
      );
    }
    
    // Return the decoded order information
    return NextResponse.json({
      success: true,
      order: {
        id: result.stripeOrder.id,
        status: result.stripeOrder.payment_status,
        customer: result.stripeOrder.customer_details,
        shipping: result.stripeOrder.shipping_details,
        amount_total: result.stripeOrder.amount_total ? result.stripeOrder.amount_total / 100 : 0,
        items: result.decodedItems
      }
    });
  } catch (error: any) {
    logger.error('Error fetching Stripe order:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred while fetching the order' },
      { status: 500 }
    );
  }
} 