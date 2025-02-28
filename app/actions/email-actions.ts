'use server';

import { getOrderByReference } from '@/lib/orders';
import { sendOrderConfirmationEmail, sendShippingConfirmationEmail, EmailResult } from '@/lib/email';
import { logger } from '@/lib/logger';

// Define standard response type for all email actions
export interface EmailActionResponse {
  success: boolean;
  message?: string;
  error?: string;
  errorCode?: string;
}

/**
 * Server action to send an order confirmation email
 */
export async function sendOrderConfirmationEmailByReference(orderReference: string): Promise<EmailActionResponse> {
  try {
    if (!orderReference) {
      return {
        success: false,
        error: 'Missing required parameter: orderReference',
        errorCode: 'MISSING_PARAMETER'
      };
    }

    // Get the order by reference
    const order = await getOrderByReference(orderReference);
    
    if (!order) {
      return {
        success: false,
        error: `Order with reference ${orderReference} not found`,
        errorCode: 'ORDER_NOT_FOUND'
      };
    }

    // Send the order confirmation email
    const emailResult = await sendOrderConfirmationEmail(order);

    if (!emailResult.success) {
      return {
        success: false,
        error: emailResult.errorDetail || 'Failed to send order confirmation email',
        errorCode: emailResult.error
      };
    }

    logger.info(`Order confirmation email sent for ${orderReference} to ${order.customerEmail}`);

    return { 
      success: true,
      message: `Order confirmation email sent to ${order.customerEmail}`
    };
  } catch (error) {
    logger.error('Error sending order confirmation email:', error);
    return {
      success: false,
      error: 'Failed to send order confirmation email',
      errorCode: 'UNKNOWN_ERROR'
    };
  }
}

/**
 * Server action to send a shipping confirmation email
 */
export async function sendShippingConfirmationEmailByReference(orderReference: string): Promise<EmailActionResponse> {
  try {
    if (!orderReference) {
      return {
        success: false,
        error: 'Missing required parameter: orderReference',
        errorCode: 'MISSING_PARAMETER'
      };
    }

    // Get the order by reference
    const order = await getOrderByReference(orderReference);
    
    if (!order) {
      return {
        success: false,
        error: `Order with reference ${orderReference} not found`,
        errorCode: 'ORDER_NOT_FOUND'
      };
    }

    // Send the shipping confirmation email
    const emailResult = await sendShippingConfirmationEmail(order);

    if (!emailResult.success) {
      return {
        success: false,
        error: emailResult.errorDetail || 'Failed to send shipping confirmation email',
        errorCode: emailResult.error
      };
    }

    logger.info(`Shipping confirmation email sent for ${orderReference} to ${order.customerEmail}`);

    return { 
      success: true,
      message: `Shipping confirmation email sent to ${order.customerEmail}`
    };
  } catch (error) {
    logger.error('Error sending shipping confirmation email:', error);
    return {
      success: false,
      error: 'Failed to send shipping confirmation email',
      errorCode: 'UNKNOWN_ERROR'
    };
  }
} 