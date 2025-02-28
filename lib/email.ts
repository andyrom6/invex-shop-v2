'use server';

import { Resend } from 'resend';
import { logger } from './logger';
import { Order } from './orders';
import { Timestamp } from 'firebase/firestore';

// Define error types for email sending
export type EmailError = 
  | 'CLIENT_SIDE_EXECUTION'
  | 'MISSING_EMAIL'
  | 'MISSING_TRACKING'
  | 'RESEND_API_ERROR'
  | 'UNKNOWN_ERROR';

// Define email result interface
export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: EmailError;
  errorDetail?: string;
}

// Initialize Resend with API key only on the server
// You'll need to add RESEND_API_KEY to your environment variables
const resend = new Resend(process.env.RESEND_API_KEY);

// Configuration from environment variables with fallbacks
const FROM_EMAIL = process.env.FROM_EMAIL || 'orders@invexshop.com';
const STORE_NAME = process.env.STORE_NAME || 'InvexShop';
const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || 'support@invexshop.com';
const SUPPORT_HOURS = process.env.SUPPORT_HOURS || 'Monday-Friday, 9am-5pm EST';
const DISCORD_URL = process.env.DISCORD_URL || '#';
const YOUTUBE_URL = process.env.YOUTUBE_URL || '#';
const TIKTOK_URL = process.env.TIKTOK_URL || '#';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://invexshop.com';

/**
 * Send an order confirmation email
 */
export async function sendOrderConfirmationEmail(order: Order): Promise<EmailResult> {
  if (typeof window !== 'undefined') {
    logger.error('Email functions cannot be called from the client side');
    return {
      success: false,
      error: 'CLIENT_SIDE_EXECUTION',
      errorDetail: 'Email functions cannot be called from the client side'
    };
  }

  if (!order.customerEmail) {
    logger.warn(`Cannot send order confirmation email: No email address for order ${order.orderReference}`);
    return {
      success: false,
      error: 'MISSING_EMAIL',
      errorDetail: `No email address for order ${order.orderReference}`
    };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: `${STORE_NAME} <${FROM_EMAIL}>`,
      to: order.customerEmail,
      subject: `Order Confirmation - ${order.orderReference}`,
      html: generateOrderConfirmationEmail(order),
    });

    if (error) {
      logger.error(`Failed to send order confirmation email for ${order.orderReference}:`, error);
      return {
        success: false,
        error: 'RESEND_API_ERROR',
        errorDetail: error.message
      };
    }

    logger.success(`Order confirmation email sent for ${order.orderReference} to ${order.customerEmail}`);
    return {
      success: true,
      messageId: data?.id
    };
  } catch (error: any) {
    logger.error(`Error sending order confirmation email for ${order.orderReference}:`, error);
    return {
      success: false,
      error: 'UNKNOWN_ERROR',
      errorDetail: error.message || 'Unknown error occurred'
    };
  }
}

/**
 * Send a shipping confirmation email with tracking information
 */
export async function sendShippingConfirmationEmail(order: Order): Promise<EmailResult> {
  if (typeof window !== 'undefined') {
    logger.error('Email functions cannot be called from the client side');
    return {
      success: false,
      error: 'CLIENT_SIDE_EXECUTION',
      errorDetail: 'Email functions cannot be called from the client side'
    };
  }

  if (!order.customerEmail) {
    logger.warn(`Cannot send shipping confirmation email: No email address for order ${order.orderReference}`);
    return {
      success: false,
      error: 'MISSING_EMAIL',
      errorDetail: `No email address for order ${order.orderReference}`
    };
  }

  if (!order.trackingNumber) {
    logger.warn(`Cannot send shipping confirmation email: No tracking number for order ${order.orderReference}`);
    return {
      success: false,
      error: 'MISSING_TRACKING',
      errorDetail: `No tracking number for order ${order.orderReference}`
    };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: `${STORE_NAME} <${FROM_EMAIL}>`,
      to: order.customerEmail,
      subject: `Your Order Has Shipped - ${order.orderReference}`,
      html: generateShippingConfirmationEmail(order),
    });

    if (error) {
      logger.error(`Failed to send shipping confirmation email for ${order.orderReference}:`, error);
      return {
        success: false,
        error: 'RESEND_API_ERROR',
        errorDetail: error.message
      };
    }

    logger.success(`Shipping confirmation email sent for ${order.orderReference} to ${order.customerEmail}`);
    return {
      success: true,
      messageId: data?.id
    };
  } catch (error: any) {
    logger.error(`Error sending shipping confirmation email for ${order.orderReference}:`, error);
    return {
      success: false,
      error: 'UNKNOWN_ERROR',
      errorDetail: error.message || 'Unknown error occurred'
    };
  }
}

/**
 * Create base email template with common structure
 */
function createBaseEmailTemplate(content: string, options: {
  title: string;
  headerGradient: string;
  headerText: string;
  headerSubtext: string;
}): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${options.title}</title>
      <meta name="color-scheme" content="light">
      <meta name="supported-color-schemes" content="light">
    </head>
    <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #374151; margin: 0; padding: 0; background-color: #f9fafb; -webkit-font-smoothing: antialiased;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; margin-top: 20px; margin-bottom: 20px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
        <!-- Header with Logo -->
        <div style="background: linear-gradient(to right, ${options.headerGradient}); padding: 30px 20px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px; letter-spacing: -0.5px;">${STORE_NAME}</h1>
          <p style="color: rgba(255, 255, 255, 0.9); margin: 8px 0 0 0; font-size: 16px;">${options.headerSubtext}</p>
        </div>
        
        <!-- Content -->
        ${content}
        
        <!-- Footer -->
        <div style="background-color: #f1f5f9; padding: 30px; text-align: center; font-size: 14px; color: #64748b; border-top: 1px solid #e2e8f0;">
          <p style="margin: 0 0 8px 0;">&copy; ${new Date().getFullYear()} ${STORE_NAME}. All rights reserved.</p>
          <p style="margin: 0;">
            If you have any questions, please contact our customer service at 
            <a href="mailto:${SUPPORT_EMAIL}" style="color: #4f46e5; text-decoration: none; font-weight: 500;">${SUPPORT_EMAIL}</a>
          </p>
          
          <!-- Social Media Icons -->
          <div style="margin-top: 20px;">
            <a href="${DISCORD_URL}" style="display: inline-block; margin: 0 8px; color: #64748b; text-decoration: none;">
              <img src="https://cdn-icons-png.flaticon.com/512/5968/5968756.png" width="24" height="24" alt="Discord" style="border: 0;">
            </a>
            <a href="${YOUTUBE_URL}" style="display: inline-block; margin: 0 8px; color: #64748b; text-decoration: none;">
              <img src="https://cdn-icons-png.flaticon.com/512/1384/1384060.png" width="24" height="24" alt="YouTube" style="border: 0;">
            </a>
            <a href="${TIKTOK_URL}" style="display: inline-block; margin: 0 8px; color: #64748b; text-decoration: none;">
              <img src="https://cdn-icons-png.flaticon.com/512/3046/3046121.png" width="24" height="24" alt="TikTok" style="border: 0;">
            </a>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Create help section for emails
 */
function createHelpSection(orderUrl: string): string {
  return `
    <div style="margin-top: 30px; border-top: 1px solid #e5e7eb; padding-top: 25px;">
      <h3 style="color: #111827; font-size: 18px; margin-top: 0; margin-bottom: 15px;">Need Help?</h3>
      <p style="color: #334155; margin-bottom: 15px;">
        If you have any questions about your order or need assistance, please don't hesitate to contact our customer service team:
      </p>
      <ul style="padding-left: 20px; color: #334155; margin-bottom: 20px;">
        <li style="margin-bottom: 8px;">Email: <a href="mailto:${SUPPORT_EMAIL}" style="color: #3b82f6; text-decoration: none; font-weight: 500;">${SUPPORT_EMAIL}</a></li>
        <li>Hours: ${SUPPORT_HOURS}</li>
      </ul>
      
      <div style="text-align: center; margin-top: 25px;">
        <a href="${orderUrl}" style="background-color: #f1f5f9; color: #334155; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 500; border: 1px solid #e2e8f0;">
          View Order Details
        </a>
      </div>
    </div>
  `;
}

/**
 * Generate HTML for order confirmation email
 */
function generateOrderConfirmationEmail(order: Order): string {
  // Convert Timestamp to Date if needed
  let orderDate: Date;
  
  if (order.createdAt instanceof Date) {
    orderDate = order.createdAt;
  } else if (order.createdAt && typeof order.createdAt === 'object' && 'toDate' in order.createdAt) {
    // Handle Firebase Timestamp
    orderDate = order.createdAt.toDate();
  } else {
    // Fallback to current date if createdAt is missing or invalid
    orderDate = new Date();
  }
  
  const formattedDate = orderDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered': return '#10b981'; // green
      case 'shipped': return '#3b82f6';   // blue
      case 'processing': return '#f59e0b'; // amber
      case 'cancelled': return '#ef4444'; // red
      default: return '#6b7280';          // gray
    }
  };

  const statusColor = getStatusColor(order.status);

  // Generate items list with improved styling
  const itemsList = order.items.map(item => {
    // Try to get image URL from item metadata
    const imageUrl = item.metadata?.imageUrl || 'https://placehold.co/80x80/f3f4f6/a1a1aa?text=Product';
    
    return `
      <tr>
        <td style="padding: 16px 0; border-bottom: 1px solid #e5e7eb;">
          <div style="display: flex; align-items: center;">
            <div style="margin-right: 15px; flex-shrink: 0;">
              <img src="${imageUrl}" alt="${item.name}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 6px; border: 1px solid #e5e7eb;">
            </div>
            <div>
              <div style="font-weight: 600; color: #111827; margin-bottom: 4px;">${item.name}</div>
              <div style="color: #6b7280; font-size: 14px;">
                ${item.metadata?.category ? `${item.metadata.category}` : ''}
                ${item.metadata?.category && item.metadata?.type ? ' • ' : ''}
                ${item.metadata?.type ? `${item.metadata.type}` : ''}
              </div>
              <div style="color: #6b7280; font-size: 14px; margin-top: 4px;">Qty: ${item.quantity}</div>
            </div>
          </div>
        </td>
        <td style="padding: 16px 0; text-align: right; border-bottom: 1px solid #e5e7eb; vertical-align: top;">
          <div style="font-weight: 600; color: #111827;">$${(item.price * item.quantity).toFixed(2)}</div>
          <div style="color: #6b7280; font-size: 14px; margin-top: 4px;">$${item.price.toFixed(2)} each</div>
        </td>
      </tr>
    `;
  }).join('');

  const orderUrl = `${SITE_URL}/orders?ref=${order.orderReference}&email=${encodeURIComponent(order.customerEmail || '')}`;

  // Calculate subtotal, discount, and shipping if available
  const subtotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discount = order.discount || 0;
  // Shipping cost is not available in the Order type, so we'll calculate it if possible
  const shipping = order.totalAmount - subtotal + discount;

  // Create the order status banner
  const orderStatusBanner = `
    <div style="background-color: #f8fafc; padding: 16px 30px; border-bottom: 1px solid #e5e7eb; text-align: center;">
      <div style="display: inline-block; background-color: ${statusColor}; color: white; font-weight: 500; padding: 6px 12px; border-radius: 9999px; font-size: 14px; letter-spacing: 0.5px;">
        ${order.status.toUpperCase()}
      </div>
      <p style="margin: 8px 0 0 0; color: #64748b; font-size: 15px;">
        Order #${order.orderReference} • ${formattedDate}
      </p>
    </div>
  `;

  // Create the main content
  const content = `
    ${orderStatusBanner}
    
    <div style="padding: 30px;">
      <p style="font-size: 16px; color: #334155; margin-top: 0;">
        We've received your order and are getting it ready to ship. We'll notify you when it's on the way!
      </p>
      
      <!-- Order Summary -->
      <h2 style="color: #111827; font-size: 20px; margin: 30px 0 16px 0; padding-bottom: 10px; border-bottom: 1px solid #e5e7eb;">
        Order Summary
      </h2>
      
      <table style="width: 100%; border-collapse: collapse;">
        <tbody>
          ${itemsList}
        </tbody>
      </table>
      
      <!-- Order Totals -->
      <div style="margin-top: 20px; background-color: #f8fafc; border-radius: 8px; padding: 16px; border: 1px solid #e5e7eb;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #64748b;">Subtotal</td>
            <td style="padding: 8px 0; text-align: right; color: #334155;">$${subtotal.toFixed(2)}</td>
          </tr>
          ${discount > 0 ? `
          <tr>
            <td style="padding: 8px 0; color: #64748b;">Discount</td>
            <td style="padding: 8px 0; text-align: right; color: #ef4444;">-$${discount.toFixed(2)}</td>
          </tr>
          ` : ''}
          ${shipping > 0 ? `
          <tr>
            <td style="padding: 8px 0; color: #64748b;">Shipping</td>
            <td style="padding: 8px 0; text-align: right; color: #334155;">$${shipping.toFixed(2)}</td>
          </tr>
          ` : ''}
          <tr>
            <td style="padding: 12px 0 4px 0; font-weight: 600; color: #111827; font-size: 16px; border-top: 1px solid #e5e7eb;">Total</td>
            <td style="padding: 12px 0 4px 0; text-align: right; font-weight: 600; color: #111827; font-size: 16px; border-top: 1px solid #e5e7eb;">$${order.totalAmount.toFixed(2)}</td>
          </tr>
        </table>
      </div>
      
      <!-- Shipping Address if available -->
      ${order.shippingAddress ? `
      <h2 style="color: #111827; font-size: 20px; margin: 30px 0 16px 0; padding-bottom: 10px; border-bottom: 1px solid #e5e7eb;">
        Shipping Address
      </h2>
      <p style="margin: 0; color: #334155;">
        ${order.shippingAddress.name || ''}<br>
        ${order.shippingAddress.address || ''}<br>
        ${order.shippingAddress.city || ''}, ${order.shippingAddress.state || ''} ${order.shippingAddress.zip || ''}<br>
        ${order.shippingAddress.country || ''}
      </p>
      ` : ''}
      
      <!-- What's Next Section -->
      <div style="margin-top: 30px; background-color: #eff6ff; border-radius: 8px; padding: 20px; border-left: 4px solid #3b82f6;">
        <h3 style="margin-top: 0; color: #1e40af; font-size: 18px;">What's Next?</h3>
        <p style="margin-bottom: 16px; color: #334155;">
          You'll receive another email when your order ships with tracking information. You can also check your order status anytime:
        </p>
        <div style="text-align: center;">
          <a href="${orderUrl}" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 500; transition: background-color 0.2s;">Track Your Order</a>
        </div>
      </div>
    </div>
  `;

  return createBaseEmailTemplate(content, {
    title: 'Order Confirmation',
    headerGradient: '#4f46e5, #6366f1',
    headerText: STORE_NAME,
    headerSubtext: 'Thank you for your order!'
  });
}

/**
 * Generate HTML for shipping confirmation email
 */
function generateShippingConfirmationEmail(order: Order): string {
  const trackingUrl = order.trackingUrl || getDefaultTrackingUrl(order.trackingNumber, order.carrier);
  const carrierName = order.carrier ? order.carrier.toUpperCase() : 'the carrier';
  const orderUrl = `${SITE_URL}/orders?ref=${order.orderReference}&email=${encodeURIComponent(order.customerEmail || '')}`;

  // Get carrier logo
  const getCarrierLogo = (carrier?: string) => {
    if (!carrier) return null;
    
    switch (carrier.toLowerCase()) {
      case 'usps':
        return 'https://www.usps.com/assets/images/home/usps-logo-2x.png';
      case 'ups':
        return 'https://www.ups.com/assets/resources/images/UPS_logo.svg';
      case 'fedex':
        return 'https://www.fedex.com/content/dam/fedex-com/logos/logo.png';
      default:
        return null;
    }
  };

  const carrierLogo = getCarrierLogo(order.carrier);

  // Create the order reference banner
  const orderReferenceBanner = `
    <div style="background-color: #f0f9ff; padding: 20px 30px; border-bottom: 1px solid #e0f2fe; text-align: center;">
      <p style="margin: 0; color: #0369a1; font-size: 16px; font-weight: 500;">
        Order #${order.orderReference}
      </p>
    </div>
  `;

  // Create tracking information section
  const trackingSection = `
    <div style="margin-top: 25px; background-color: #f0f9ff; border-radius: 8px; padding: 20px; border-left: 4px solid #3b82f6;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
        <h3 style="margin: 0; color: #0c4a6e; font-size: 18px;">Tracking Information</h3>
        ${carrierLogo ? `<img src="${carrierLogo}" alt="${carrierName}" style="height: 30px; max-width: 100px;">` : ''}
      </div>
      
      <div style="margin-bottom: 15px;">
        <div style="margin-bottom: 10px;">
          <span style="color: #0369a1; font-weight: 500;">Carrier:</span> 
          <span style="color: #334155;">${order.carrier ? order.carrier.toUpperCase() : 'Standard Shipping'}</span>
        </div>
        <div style="margin-bottom: 10px;">
          <span style="color: #0369a1; font-weight: 500;">Tracking Number:</span> 
          <span style="color: #334155; font-family: monospace; font-size: 15px;">${order.trackingNumber}</span>
        </div>
      </div>
      
      <div style="text-align: center; margin-top: 20px;">
        <a href="${trackingUrl}" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 500; transition: background-color 0.2s;">
          Track Your Package
        </a>
      </div>
    </div>
  `;

  // Create order items summary section
  const orderItemsSection = order.items && order.items.length > 0 ? `
    <div style="margin-top: 30px;">
      <h3 style="color: #111827; font-size: 18px; margin-bottom: 15px; padding-bottom: 8px; border-bottom: 1px solid #e5e7eb;">Order Summary</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tbody>
          ${order.items.map(item => {
            const imageUrl = item.metadata?.imageUrl || 'https://placehold.co/80x80/f3f4f6/a1a1aa?text=Product';
            return `
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
                <div style="display: flex; align-items: center;">
                  <div style="margin-right: 15px; flex-shrink: 0;">
                    <img src="${imageUrl}" alt="${item.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 6px; border: 1px solid #e5e7eb;">
                  </div>
                  <div>
                    <div style="font-weight: 500; color: #111827;">${item.name}</div>
                    <div style="color: #6b7280; font-size: 14px;">Qty: ${item.quantity}</div>
                  </div>
                </div>
              </td>
            </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </div>
  ` : '';

  // Create the main content
  const content = `
    ${orderReferenceBanner}
    
    <div style="padding: 30px;">
      <p style="font-size: 16px; color: #334155; margin-top: 0;">
        Great news! Your order is on its way to you. You can track your package using the information below.
      </p>
      
      <!-- Tracking Information -->
      ${trackingSection}
      
      <!-- Order Items Summary (if available) -->
      ${orderItemsSection}
      
      <!-- Need Help Section -->
      ${createHelpSection(orderUrl)}
    </div>
  `;

  return createBaseEmailTemplate(content, {
    title: 'Your Order Has Shipped',
    headerGradient: '#3b82f6, #60a5fa',
    headerText: STORE_NAME,
    headerSubtext: 'Your order is on the way!'
  });
}

/**
 * Get default tracking URL based on carrier and tracking number
 */
function getDefaultTrackingUrl(trackingNumber?: string, carrier?: string): string {
  if (!trackingNumber) return '#';
  
  const normalizedCarrier = carrier?.toLowerCase() || '';
  
  switch (normalizedCarrier) {
    case 'usps':
      return `https://tools.usps.com/go/TrackConfirmAction?tLabels=${trackingNumber}`;
    case 'ups':
      return `https://www.ups.com/track?tracknum=${trackingNumber}`;
    case 'fedex':
      return `https://www.fedex.com/fedextrack/?trknbr=${trackingNumber}`;
    default:
      // Generic tracking URL or fallback
      return `https://www.google.com/search?q=${encodeURIComponent(`${carrier || ''} tracking ${trackingNumber}`)}`;
  }
} 