import { NextRequest, NextResponse } from 'next/server';
import { stripe, formatAmountForStripe } from '@/lib/stripe';
import { headers } from 'next/headers';
import { createOrder } from '@/lib/orders';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { items } = body;
    
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
    
    // Store the order in Firebase
    try {
      // Format items for our order schema
      const orderItems = items.map((item: any) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity || 1,
        image: item.images && item.images.length > 0 ? item.images[0] : undefined,
        metadata: item.metadata || {}
      }));
      
      // Create the order in our database
      await createOrder({
        orderReference,
        items: orderItems,
        totalAmount,
        status: 'pending'
      });
      
      console.log('Order created successfully:', orderReference);
    } catch (dbError) {
      console.error('Error storing order in database:', dbError);
      // Continue with checkout even if database storage fails
    }
    
    // Create individual line items for each product
    const lineItems = items.map((item: any) => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.name,
        },
        unit_amount: formatAmountForStripe(item.price, 'usd'),
      },
      quantity: item.quantity || 1,
    }));

    // Get the origin for success and cancel URLs
    const headersList = headers();
    const origin = headersList.get('origin') || 'http://localhost:3000';

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}&ref=${orderReference}`,
      cancel_url: `${origin}/cart?ref=${orderReference}`,
      client_reference_id: orderReference, // Add reference ID to Stripe session
      shipping_address_collection: {
        allowed_countries: ['US'], // Restrict to US customers only
      },
      shipping_options: [
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: {
              amount: 1200, // $12.00
              currency: 'usd',
            },
            display_name: 'Standard',
            // Removed detailed delivery estimates
          },
        },
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: {
              amount: 2500, // $25.00
              currency: 'usd',
            },
            display_name: 'Express',
            // Removed detailed delivery estimates
          },
        },
      ],
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