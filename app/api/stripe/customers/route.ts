import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2023-10-16',
});

export async function GET() {
  try {
    // Fetch all customers from Stripe
    const customers = await stripe.customers.list({
      limit: 100, // Adjust limit as needed
      expand: ['data.default_source'],
    });

    // Fetch all successful checkout sessions
    const sessions = await stripe.checkout.sessions.list({
      limit: 100, // Adjust as needed
      status: 'complete',
      expand: ['data.customer', 'data.customer_details'],
    });

    // Process registered customers
    const enhancedCustomers = customers.data.map((customer) => {
      // Find all sessions for this customer
      const customerSessions = sessions.data.filter(
        (session) => {
          // Check if session.customer is a string or an object
          if (typeof session.customer === 'string') {
            return session.customer === customer.id;
          } else if (session.customer) {
            return (session.customer as Stripe.Customer).id === customer.id;
          }
          return false;
        }
      );

      // Calculate total spent
      const totalSpent = customerSessions.reduce(
        (sum, session) => sum + (session.amount_total || 0) / 100, // Convert cents to dollars
        0
      );

      // Return enhanced customer object
      return {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        created: customer.created,
        metadata: customer.metadata,
        default_address: {
          city: customer.address?.city,
          country: customer.address?.country,
          line1: customer.address?.line1,
          line2: customer.address?.line2,
          postal_code: customer.address?.postal_code,
          state: customer.address?.state,
        },
        orders_count: customerSessions.length,
        total_spent: totalSpent,
        is_guest: false,
      };
    });

    // Find sessions without a customer (guest checkouts)
    const guestSessions = sessions.data.filter(session => !session.customer);
    
    // Group guest sessions by email to create "guest customers"
    const guestsByEmail = new Map();
    
    guestSessions.forEach(session => {
      const email = session.customer_details?.email;
      if (!email) return; // Skip if no email available
      
      if (!guestsByEmail.has(email)) {
        guestsByEmail.set(email, {
          sessions: [],
          customer_details: session.customer_details,
          created: session.created
        });
      }
      
      guestsByEmail.get(email).sessions.push(session);
    });
    
    // Create guest customer objects
    const guestCustomers = Array.from(guestsByEmail.entries()).map(([email, data]) => {
      const { sessions, customer_details, created } = data;
      
      // Calculate total spent
      const totalSpent = sessions.reduce(
        (sum: number, session: Stripe.Checkout.Session) => sum + (session.amount_total || 0) / 100, 
        0
      );
      
      // Return guest customer object
      return {
        id: `guest_${email.replace('@', '_at_')}`,
        name: customer_details?.name || 'Guest Customer',
        email: email,
        phone: customer_details?.phone || null,
        created: created,
        metadata: {},
        default_address: customer_details?.address ? {
          city: customer_details.address.city,
          country: customer_details.address.country,
          line1: customer_details.address.line1,
          line2: customer_details.address.line2,
          postal_code: customer_details.address.postal_code,
          state: customer_details.address.state,
        } : undefined,
        orders_count: sessions.length,
        total_spent: totalSpent,
        is_guest: true,
      };
    });
    
    // Combine both customer lists
    const allCustomers = [...enhancedCustomers, ...guestCustomers];

    return NextResponse.json({
      customers: allCustomers,
    });
  } catch (error) {
    console.error('Error fetching customers from Stripe:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customers' },
      { status: 500 }
    );
  }
} 