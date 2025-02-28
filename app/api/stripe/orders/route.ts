import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { getOrderByReference, decodeProductName } from '@/lib/orders';
import { logger } from '@/lib/logger';

export async function GET(req: NextRequest) {
  try {
    // Get the limit and status from query parameters
    const url = new URL(req.url);
    const limitParam = url.searchParams.get('limit');
    const statusParam = url.searchParams.get('status');
    const limit = limitParam ? parseInt(limitParam, 10) : 10;
    
    // Fetch recent checkout sessions from Stripe
    const sessions = await stripe.checkout.sessions.list({
      limit: limit * 2, // Fetch more to account for filtering
      expand: ['data.customer', 'data.line_items']
    });
    
    // Filter sessions by payment status if requested
    let filteredSessions = sessions.data;
    if (statusParam === 'paid') {
      filteredSessions = sessions.data.filter(session => 
        session.payment_status === 'paid'
      );
    }
    
    // Limit the number of sessions after filtering
    filteredSessions = filteredSessions.slice(0, limit);
    
    // Process each session to decode product names
    const processedOrders = await Promise.all(
      filteredSessions.map(async (session) => {
        // Skip sessions without a client_reference_id
        if (!session.client_reference_id) {
          // Extract discount information if available
          let discountAmount = 0;
          if (session.total_details && 
              session.total_details.breakdown && 
              session.total_details.breakdown.discounts && 
              session.total_details.breakdown.discounts.length > 0) {
            discountAmount = session.total_details.breakdown.discounts.reduce(
              (sum, discount) => sum + discount.amount, 0
            );
          }
          
          return {
            id: session.id,
            reference: null,
            date: new Date(session.created * 1000).toISOString(),
            status: session.payment_status,
            customer: session.customer_details,
            amount_total: session.amount_total ? session.amount_total / 100 : 0,
            discount: discountAmount / 100,
            items: session.line_items?.data.map(item => ({
              description: item.description || '',
              decodedName: null,
              quantity: item.quantity || 1,
              amount: item.amount_total ? item.amount_total / 100 : 0
            })) || []
          };
        }
        
        // Try to find our internal order
        const order = await getOrderByReference(session.client_reference_id);
        
        // Log order status for debugging
        if (order) {
          logger.info(`Found order in database: ${session.client_reference_id}, status: ${order.status}`);
        } else {
          logger.info(`Order not found in database: ${session.client_reference_id}, using Stripe status: ${session.payment_status}`);
        }
        
        // Process line items
        const items = session.line_items?.data.map(item => {
          const encodedName = item.description || '';
          const decodedName = order ? decodeProductName(encodedName, order) : null;
          
          return {
            description: encodedName,
            decodedName,
            quantity: item.quantity,
            amount: item.amount_total ? item.amount_total / 100 : 0
          };
        }) || [];
        
        // Extract discount information if available
        let discountAmount = 0;
        if (session.total_details && 
            session.total_details.breakdown && 
            session.total_details.breakdown.discounts && 
            session.total_details.breakdown.discounts.length > 0) {
          discountAmount = session.total_details.breakdown.discounts.reduce(
            (sum, discount) => sum + discount.amount, 0
          );
        }

        return {
          id: session.id,
          reference: session.client_reference_id,
          date: new Date(session.created * 1000).toISOString(),
          status: order ? order.status : session.payment_status,
          customer: session.customer_details,
          amount_total: session.amount_total ? session.amount_total / 100 : 0,
          discount: discountAmount / 100,
          items
        };
      })
    );
    
    return NextResponse.json({
      success: true,
      orders: processedOrders
    });
  } catch (error: any) {
    logger.error('Error fetching Stripe orders:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred while fetching orders' },
      { status: 500 }
    );
  }
} 