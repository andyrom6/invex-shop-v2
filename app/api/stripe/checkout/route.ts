import { NextRequest, NextResponse } from 'next/server';
import { stripe, formatAmountForStripe } from '@/lib/stripe';
import { headers } from 'next/headers';
import { createOrder } from '@/lib/orders';
import { logger } from '@/lib/logger';

// Function to encode product information
function encodeProductInfo(item: any, orderCode: string, index: number): string {
  // Use "Cologne" as the generic product name for all items
  const genericName = "Cologne";
  
  // Add a subtle reference code that we can use for decoding
  // This looks like a simple SKU or product code to customers
  const refCode = `${orderCode.substring(0, 3)}${index + 1}`;
  
  return `${genericName} (${refCode})`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { items, customerEmail } = body;
    
    // Log the received customer email
    logger.info(`Checkout API received customerEmail: ${customerEmail || 'undefined'}`);
    
    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: 'No items provided' },
        { status: 400 }
      );
    }

    // Calculate total amount from all items
    const totalAmount = items.reduce((sum: number, item: any) => {
      return sum + (item.price * (item.quantity || 1));
    }, 0);
    
    // Generate a unique order reference
    const orderReference = `order_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    
    // Create a short order code for product names
    const orderCode = orderReference.split('_')[2] || Math.random().toString(36).substring(2, 7);
    
    // Create a mapping of encoded names to actual products for later reference
    const productMapping: Record<string, any> = {};
    
    // Store the order in Firebase
    try {
      // Format items for our order schema
      const orderItems = items.map((item: any, index: number) => {
        // Generate the encoded product name
        const encodedName = encodeProductInfo(item, orderCode, index);
        
        // Extract the reference code for easier lookup
        const refCode = encodedName.match(/\(([^)]+)\)$/)?.[1] || '';
        
        // Store the mapping for later reference
        productMapping[encodedName] = {
          id: item.id,
          name: item.name,
          refCode, // Store the reference code for easier lookup
          metadata: item.metadata || {}
        };
        
        return {
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity || 1,
          image: item.images && item.images.length > 0 ? item.images[0] : undefined,
          metadata: {
            ...item.metadata || {},
            encodedName, // Store the encoded name in metadata for reference
            refCode // Also store the reference code for easier lookup
          }
        };
      });
      
      // Log the order data being created
      logger.info(`Creating order with email: ${customerEmail || 'undefined'}`);
      
      // Create the order in our database with the product mapping
      await createOrder({
        orderReference,
        items: orderItems,
        totalAmount,
        status: 'pending',
        productMapping, // Store the mapping in the order for later decoding
        customerEmail: customerEmail || undefined // Include customer email in the order
      });
      
      logger.info(`Order created successfully: ${orderReference}, email: ${customerEmail || 'undefined'}`);
    } catch (dbError) {
      logger.error('Error storing order in database:', dbError);
      // Continue with checkout even if database storage fails
    }
    
    // Create individual line items for each product with obscured names
    const lineItems = items.map((item: any, index: number) => {
      // Generate the encoded product name
      const encodedName = encodeProductInfo(item, orderCode, index);
      
      return {
        price_data: {
          currency: 'usd',
          product_data: {
            name: encodedName,
          },
          unit_amount: formatAmountForStripe(item.price, 'usd'),
        },
        quantity: item.quantity || 1,
      };
    });

    // Get the origin for success and cancel URLs
    const headersList = headers();
    const origin = headersList.get('origin') || 'http://localhost:3000';

    // Check if there are physical items that require shipping
    const hasPhysicalItems = items.some((item: any) => !item.metadata?.digital);
    
    // If there are physical items, add shipping as a line item so promo codes apply to it
    if (hasPhysicalItems) {
      // Add standard shipping as a line item
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Standard Shipping',
          },
          unit_amount: 1200, // $12.00
        },
        quantity: 1,
      });
    }
    
    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}&ref=${orderReference}`,
      cancel_url: `${origin}/cart?ref=${orderReference}`,
      client_reference_id: orderReference, // Add reference ID to Stripe session
      metadata: {
        orderReference,
      },
      // Allow customers to enter promotion codes at checkout
      allow_promotion_codes: true,
      // Add explicit domain information to help with TLD detection
      customer_email: body.customerEmail || undefined,
      billing_address_collection: 'auto',
      shipping_address_collection: hasPhysicalItems ? {
        allowed_countries: ['US'], // Restrict to US customers only
      } : undefined,
    });
    
    return NextResponse.json({ 
      sessionId: session.id, 
      url: session.url,
      orderReference // Return the reference to the frontend
    });
  } catch (error: any) {
    console.error('Stripe checkout error:', error);
    
    return NextResponse.json(
      { error: error.message || 'An error occurred with the payment' },
      { status: 500 }
    );
  }
} 