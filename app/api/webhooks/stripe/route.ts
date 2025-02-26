import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { updateOrderWithStripeSession, updateOrderStatus } from '@/lib/orders';
import { headers } from 'next/headers';
import { logger } from '@/lib/logger';

// This is your Stripe webhook secret for testing your endpoint locally.
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = headers().get('stripe-signature') as string;

  let event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
  } catch (err: any) {
    logger.error(`Webhook Error: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        
        // Extract the client_reference_id which contains our order reference
        const orderReference = session.client_reference_id || '';
        const sessionId = session.id;
        const customerEmail = session.customer_details?.email || undefined;
        
        if (orderReference) {
          // Update the order with Stripe session details
          await updateOrderWithStripeSession(
            orderReference,
            sessionId,
            customerEmail
          );
          
          // Update order status to processing
          await updateOrderStatus(orderReference, 'processing');
          
          logger.info(`Order ${orderReference} updated with Stripe session ${sessionId}`);
        }
        break;
      }
      
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object;
        logger.info(`PaymentIntent for ${paymentIntent.amount} was successful!`);
        break;
      }
      
      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object;
        logger.error(`Payment failed: ${paymentIntent.last_payment_error?.message}`);
        break;
      }
      
      default:
        logger.info(`Unhandled event type ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    logger.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Error processing webhook' },
      { status: 500 }
    );
  }
} 