/**
 * STRIPE WEBHOOK HANDLER
 * 
 * This webhook handles Stripe checkout events and updates orders in your database.
 * 
 * To enable this webhook:
 * 1. Set STRIPE_WEBHOOK_SECRET in your environment variables
 * 2. Configure a webhook endpoint in your Stripe Dashboard pointing to /api/webhooks/stripe
 * 3. Select the 'checkout.session.completed' event to listen for
 * 
 * For local testing:
 * 1. Install Stripe CLI: brew install stripe/stripe-cli/stripe
 * 2. Login: stripe login
 * 3. Forward events: stripe listen --forward-to localhost:3000/api/webhooks/stripe
 * 4. Use the provided webhook secret in your environment variables
 * 
 * Note: Without webhooks, orders will still be created but their status won't 
 * automatically update to 'processing' when payment completes.
 */

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { updateOrderWithStripeSession, getOrderByReference } from '@/lib/orders';
import { logger } from '@/lib/logger';
import { sendOrderConfirmationEmail } from '@/lib/email';
import { updateProductStock } from '@/lib/product-utils';

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2023-10-16',
});

/**
 * Stripe webhook handler
 * 
 * This endpoint processes Stripe webhook events, particularly checkout events.
 * It updates orders in our database with Stripe session details.
 * 
 * Required environment variables:
 * - STRIPE_WEBHOOK_SECRET: Your Stripe webhook signing secret
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature') as string;
    
    // Verify the webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET as string
      );
    } catch (err) {
      logger.error('Webhook signature verification failed:', err);
      return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 });
    }
    
    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        logger.info(`Checkout session completed: ${session.id}`);
        
        // Extract the order reference from client_reference_id
        const orderReference = session.client_reference_id || '';
        
        if (!orderReference) {
          logger.warn(`No client_reference_id found in session ${session.id}`);
          return NextResponse.json({ error: 'No order reference found' }, { status: 400 });
        }
        
        // Get customer email from the session
        const customerEmail = session.customer_details?.email || undefined;
        
        // Update the order with Stripe session details
        await updateOrderWithStripeSession(
          orderReference,
          session.id,
          customerEmail
        );
        
        // Update order status to 'processing'
        const updatedOrder = await getOrderByReference(orderReference);
        
        // Update product stock levels
        if (updatedOrder && updatedOrder.items && updatedOrder.items.length > 0) {
          logger.info(`Updating stock for order ${orderReference} with ${updatedOrder.items.length} items`);
          
          const stockUpdateResult = await updateProductStock(updatedOrder.items);
          
          if (stockUpdateResult.success) {
            logger.success(`Successfully updated stock for order ${orderReference}`);
            
            if (stockUpdateResult.errors && stockUpdateResult.errors.length > 0) {
              logger.warn(`Some stock updates had issues: ${stockUpdateResult.errors.join(', ')}`);
            }
          } else {
            logger.error(`Failed to update stock for order ${orderReference}`);
          }
        } else {
          logger.warn(`No items found in order ${orderReference}, skipping stock update`);
        }
        
        // Send order confirmation email
        if (updatedOrder && updatedOrder.customerEmail) {
          logger.info(`Sending order confirmation email for ${orderReference} to ${updatedOrder.customerEmail}`);
          const emailResult = await sendOrderConfirmationEmail(updatedOrder);
          
          if (emailResult.success) {
            logger.success(`Order confirmation email sent for ${orderReference} to ${updatedOrder.customerEmail}`);
          } else {
            logger.warn(`Failed to send order confirmation email: ${emailResult.errorDetail}`);
          }
        } else {
          logger.warn(`Could not send order confirmation email: ${updatedOrder ? 'No customer email' : 'Order not found'}`);
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
        logger.info(`Unhandled event type: ${event.type}`);
    }
    
    return NextResponse.json({ received: true });
  } catch (error) {
    logger.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
} 