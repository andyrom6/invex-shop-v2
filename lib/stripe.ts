import Stripe from 'stripe';
import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe with the secret key from environment variables
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16', // Use the latest API version
});

// Load Stripe.js on the client side
export const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

// Helper function to format amount for Stripe (converts dollars to cents)
export const formatAmountForStripe = (amount: number, currency: string): number => {
  const numberFormat = new Intl.NumberFormat(['en-US'], {
    style: 'currency',
    currency: currency,
    currencyDisplay: 'symbol',
  });
  const parts = numberFormat.formatToParts(amount);
  let zeroDecimalCurrency = true;
  
  for (const part of parts) {
    if (part.type === 'decimal') {
      zeroDecimalCurrency = false;
    }
  }
  
  return zeroDecimalCurrency ? amount : Math.round(amount * 100);
};

// Helper function to format amount from Stripe (converts cents to dollars)
export const formatAmountFromStripe = (amount: number, currency: string): number => {
  const numberFormat = new Intl.NumberFormat(['en-US'], {
    style: 'currency',
    currency: currency,
    currencyDisplay: 'symbol',
  });
  const parts = numberFormat.formatToParts(1);
  let zeroDecimalCurrency = true;
  
  for (const part of parts) {
    if (part.type === 'decimal') {
      zeroDecimalCurrency = false;
    }
  }
  
  return zeroDecimalCurrency ? amount : amount / 100;
};

// Function to fetch recent orders from Stripe and decode them
export async function fetchRecentStripeOrders(limit = 10) {
  try {
    // Fetch recent checkout sessions from Stripe
    const sessions = await stripe.checkout.sessions.list({
      limit,
      expand: ['data.customer', 'data.line_items']
    });
    
    // For each session, try to find a matching order in our database
    const ordersWithDecoding = await Promise.all(
      sessions.data.map(async (session) => {
        // Skip sessions without a client_reference_id
        if (!session.client_reference_id) {
          return {
            session,
            decodedItems: [],
            internalOrder: null
          };
        }
        
        // Import the necessary Firebase functions
        const { collection, query, where, getDocs, limit } = await import('firebase/firestore');
        const { db } = await import('./firebase');
        const { decodeProductName } = await import('./orders');
        
        // Find the matching order in our database
        const ordersQuery = query(
          collection(db, 'orders'),
          where('orderReference', '==', session.client_reference_id),
          limit(1)
        );
        
        const querySnapshot = await getDocs(ordersQuery);
        
        if (querySnapshot.empty) {
          return {
            session,
            decodedItems: [],
            internalOrder: null
          };
        }
        
        const orderDoc = querySnapshot.docs[0];
        const orderData = orderDoc.data();
        
        // Type for order with productMapping
        type OrderWithMapping = {
          id: string;
          productMapping?: Record<string, any>;
          [key: string]: any;
        };
        
        const order: OrderWithMapping = {
          id: orderDoc.id,
          ...orderData,
          createdAt: orderData.createdAt?.toDate() || new Date(),
          updatedAt: orderData.updatedAt?.toDate() || new Date()
        };
        
        // Decode the line items if available
        const lineItems = session.line_items?.data || [];
        const decodedItems = lineItems.map(item => {
          const encodedName = item.description || '';
          let decodedName = encodedName;
          
          // Try to decode using our product mapping
          if (order.productMapping) {
            // First try direct lookup
            if (order.productMapping[encodedName]) {
              decodedName = order.productMapping[encodedName].name;
            } else {
              // Extract reference code and try to find a match
              const match = encodedName.match(/\(([^)]+)\)$/);
              const refCode = match ? match[1] : null;
              
              if (refCode) {
                const matchingKey = Object.keys(order.productMapping).find(key => 
                  key.includes(refCode)
                );
                
                if (matchingKey) {
                  decodedName = order.productMapping[matchingKey].name;
                }
              }
            }
          }
          
          return {
            description: encodedName,
            decodedName,
            quantity: item.quantity || 0,
            amount: item.amount_total ? item.amount_total / 100 : 0
          };
        });
        
        return {
          session,
          decodedItems,
          internalOrder: order
        };
      })
    );
    
    return ordersWithDecoding;
  } catch (error) {
    console.error('Error fetching Stripe orders:', error);
    throw error;
  }
} 