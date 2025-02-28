import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { updateOrderStatus, getOrderById, getOrderByReference } from '@/lib/orders';
import { logger } from '@/lib/logger';
import { sendShippingConfirmationEmailByReference } from '@/app/actions/email-actions';

export async function POST(request: NextRequest) {
  try {
    const { orderId, status, sessionId, trackingNumber, trackingUrl, carrier } = await request.json();

    if (!orderId || !status) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    logger.info(`Updating order status for ${orderId} to ${status}`);

    // Update order status in database
    let updatedOrder = null;
    
    if (status === 'shipped' && trackingNumber) {
      updatedOrder = await updateOrderStatus(orderId, status, {
        trackingNumber,
        trackingUrl,
        carrier
      });
      
      // Send shipping confirmation email if order was updated successfully
      if (updatedOrder && updatedOrder.customerEmail) {
        logger.info(`Requesting shipping confirmation email for order ${orderId}`);
        
        // Use the server action to send the email
        const emailResult = await sendShippingConfirmationEmailByReference(updatedOrder.orderReference);
        
        if (emailResult.success) {
          logger.info(`Shipping confirmation email sent for order ${orderId}`);
        } else {
          logger.warn(`Failed to send shipping confirmation email: ${emailResult.error} (${emailResult.errorCode})`);
        }
      } else {
        logger.warn(`Could not send shipping confirmation email for order ${orderId}: Order not found or missing email`);
      }
    } else {
      updatedOrder = await updateOrderStatus(orderId, status);
    }

    // Log update for session if provided
    if (sessionId) {
      logger.info(`Logged status update for session ${sessionId}`);
    }

    return NextResponse.json({ 
      success: true,
      order: updatedOrder ? {
        id: updatedOrder.id,
        orderReference: updatedOrder.orderReference,
        status: updatedOrder.status
      } : null
    });
  } catch (error) {
    logger.error('Error updating order status:', error);
    return NextResponse.json(
      { error: 'Failed to update order status' },
      { status: 500 }
    );
  }
} 