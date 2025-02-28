import { db } from './firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  getDoc, 
  doc, 
  query, 
  where, 
  orderBy, 
  updateDoc,
  Timestamp,
  DocumentData,
  limit
} from 'firebase/firestore';
import { logger } from '@/lib/logger';

// Define order status types
export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

// Define order item interface
export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  metadata: {
    category: string;
    type: string;
    [key: string]: any;
  };
}

// Define order interface
export interface Order {
  id?: string;
  orderReference: string;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  shippingAddress?: {
    name: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  shippingMethod?: string;
  stripeSessionId?: string;
  customerEmail?: string;
  trackingNumber?: string;
  trackingUrl?: string;
  carrier?: string;
  productMapping?: Record<string, any>; // Mapping of encoded product names to actual products
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
  discount?: number; // Amount of discount applied
}

// Create a new order
export async function createOrder(orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  try {
    const now = Timestamp.now();
    const orderWithTimestamps = {
      ...orderData,
      createdAt: now,
      updatedAt: now
    };
    
    const docRef = await addDoc(collection(db, 'orders'), orderWithTimestamps);
    return docRef.id;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
}

// Get all orders
export async function getOrders(): Promise<Order[]> {
  try {
    const ordersQuery = query(
      collection(db, 'orders'),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(ordersQuery);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date()
      } as Order;
    });
  } catch (error) {
    console.error('Error getting orders:', error);
    throw error;
  }
}

// Get order by ID
export async function getOrderById(orderId: string): Promise<Order | null> {
  try {
    const docRef = doc(db, 'orders', orderId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date()
      } as Order;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting order by ID:', error);
    throw error;
  }
}

// Get order by reference
export async function getOrderByReference(reference: string): Promise<Order | null> {
  try {
    const ordersQuery = query(
      collection(db, 'orders'),
      where('orderReference', '==', reference),
      limit(1)
    );
    
    const querySnapshot = await getDocs(ordersQuery);
    
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date()
      } as Order;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting order by reference:', error);
    throw error;
  }
}

// Update order status
export async function updateOrderStatus(
  orderId: string, 
  status: OrderStatus, 
  trackingInfo?: { trackingNumber: string; trackingUrl?: string; carrier?: string }
): Promise<Order | null> {
  try {
    let updatedOrderId: string | null = null;
    
    // Check if this is a Stripe session ID (starts with 'cs_')
    if (orderId.startsWith('cs_')) {
      // Find the order with this Stripe session ID
      const ordersQuery = query(
        collection(db, 'orders'),
        where('stripeSessionId', '==', orderId),
        limit(1)
      );
      
      const querySnapshot = await getDocs(ordersQuery);
      
      if (querySnapshot.empty) {
        logger.warn(`No order found with Stripe session ID: ${orderId}. Cannot update status.`);
        return null;
      }
      
      // Update the found order
      updatedOrderId = querySnapshot.docs[0].id;
      const docRef = doc(db, 'orders', updatedOrderId);
      const updateData: any = {
        status,
        updatedAt: Timestamp.now()
      };
      
      // Add tracking information if provided and status is 'shipped'
      if (status === 'shipped' && trackingInfo) {
        updateData.trackingNumber = trackingInfo.trackingNumber;
        if (trackingInfo.trackingUrl) {
          updateData.trackingUrl = trackingInfo.trackingUrl;
        }
        if (trackingInfo.carrier) {
          updateData.carrier = trackingInfo.carrier;
        }
      }
      
      await updateDoc(docRef, updateData);
      logger.info(`Successfully updated order status to ${status} for Stripe session ${orderId}`);
    } else if (orderId.startsWith('order_')) {
      // This is an order reference, not a document ID
      const order = await getOrderByReference(orderId);
      
      if (!order || !order.id) {
        logger.warn(`No order found with reference: ${orderId}. Cannot update status.`);
        return null;
      }
      
      // Update using the document ID
      updatedOrderId = order.id;
      const docRef = doc(db, 'orders', updatedOrderId);
      const updateData: any = {
        status,
        updatedAt: Timestamp.now()
      };
      
      // Add tracking information if provided and status is 'shipped'
      if (status === 'shipped' && trackingInfo) {
        updateData.trackingNumber = trackingInfo.trackingNumber;
        if (trackingInfo.trackingUrl) {
          updateData.trackingUrl = trackingInfo.trackingUrl;
        }
        if (trackingInfo.carrier) {
          updateData.carrier = trackingInfo.carrier;
        }
      }
      
      await updateDoc(docRef, updateData);
      logger.info(`Successfully updated order status to ${status} for order reference ${orderId}`);
    } else {
      // Treat as a regular Firestore document ID
      updatedOrderId = orderId;
      const docRef = doc(db, 'orders', updatedOrderId);
      
      // Check if the document exists first
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        logger.warn(`No order found with document ID: ${orderId}. Cannot update status.`);
        return null;
      }
      
      const updateData: any = {
        status,
        updatedAt: Timestamp.now()
      };
      
      // Add tracking information if provided and status is 'shipped'
      if (status === 'shipped' && trackingInfo) {
        updateData.trackingNumber = trackingInfo.trackingNumber;
        if (trackingInfo.trackingUrl) {
          updateData.trackingUrl = trackingInfo.trackingUrl;
        }
        if (trackingInfo.carrier) {
          updateData.carrier = trackingInfo.carrier;
        }
      }
      
      await updateDoc(docRef, updateData);
      logger.info(`Successfully updated order status to ${status} for order ID ${orderId}`);
    }
    
    // Return the updated order
    if (updatedOrderId) {
      return await getOrderById(updatedOrderId);
    }
    
    return null;
  } catch (error) {
    logger.error('Error updating order status:', error);
    throw error;
  }
}

// Update order with Stripe session details
export async function updateOrderWithStripeSession(
  orderReference: string, 
  stripeSessionId: string,
  customerEmail?: string
): Promise<void> {
  try {
    logger.info(`updateOrderWithStripeSession called with email: ${customerEmail || 'undefined'}`);
    
    const order = await getOrderByReference(orderReference);
    
    if (!order || !order.id) {
      logger.warn(`Order with reference ${orderReference} not found. Cannot update with Stripe session.`);
      return; // Exit gracefully instead of throwing an error
    }
    
    const docRef = doc(db, 'orders', order.id);
    
    // Create update object without customerEmail if it's undefined
    const updateData: any = {
      stripeSessionId,
      updatedAt: Timestamp.now()
    };
    
    // Only include customerEmail if it's provided
    if (customerEmail !== undefined) {
      updateData.customerEmail = customerEmail;
      logger.info(`Adding customerEmail to update: ${customerEmail}`);
    } else {
      logger.info('customerEmail is undefined, not adding to update');
    }
    
    await updateDoc(docRef, updateData);
    logger.info(`Successfully updated order ${orderReference} with Stripe session ID ${stripeSessionId} and email: ${customerEmail || 'undefined'}`);
  } catch (error) {
    logger.error('Error updating order with Stripe session:', error);
    throw error;
  }
}

// Extract the reference code from a customer-friendly encoded name
function extractReferenceCode(encodedName: string): string | null {
  // Look for a pattern like "Product Name (abc123)" and extract "abc123"
  const match = encodedName.match(/\(([^)]+)\)$/);
  return match ? match[1] : null;
}

// Decode a product name from Stripe using the order's product mapping
export function decodeProductName(encodedName: string, order: Order): string {
  if (!order.productMapping) {
    return encodedName; // Return the encoded name if we don't have a mapping
  }
  
  // First try direct lookup
  if (order.productMapping[encodedName]) {
    return order.productMapping[encodedName].name;
  }
  
  // If direct lookup fails, try to extract the reference code and find a match
  const refCode = extractReferenceCode(encodedName);
  if (refCode) {
    // Look for any key in productMapping that contains this refCode
    const matchingKey = Object.keys(order.productMapping).find(key => 
      key.includes(refCode)
    );
    
    if (matchingKey) {
      return order.productMapping[matchingKey].name;
    }
  }
  
  // If all else fails, return the encoded name
  return encodedName;
}

// Fetch order details from Stripe and decode product names
export async function fetchAndDecodeStripeOrder(stripeSessionId: string): Promise<{
  stripeOrder: any;
  decodedItems: Array<{
    description: string;
    decodedName: string | null;
    quantity: number;
    amount: number;
  }>;
} | null> {
  try {
    // First, find our internal order that matches this Stripe session
    const ordersQuery = query(
      collection(db, 'orders'),
      where('stripeSessionId', '==', stripeSessionId),
      limit(1)
    );
    
    const querySnapshot = await getDocs(ordersQuery);
    
    if (querySnapshot.empty) {
      console.error('No matching order found for Stripe session:', stripeSessionId);
      return null;
    }
    
    const orderDoc = querySnapshot.docs[0];
    const order = {
      id: orderDoc.id,
      ...orderDoc.data(),
      createdAt: orderDoc.data().createdAt?.toDate() || new Date(),
      updatedAt: orderDoc.data().updatedAt?.toDate() || new Date()
    } as Order;
    
    // Import the Stripe instance dynamically to avoid server/client mismatch issues
    const { stripe } = await import('@/lib/stripe');
    
    // Fetch the session from Stripe
    const session = await stripe.checkout.sessions.retrieve(stripeSessionId);
    
    // Fetch line items from the session
    const lineItems = await stripe.checkout.sessions.listLineItems(stripeSessionId);
    
    // Decode each line item
    const decodedItems = lineItems.data.map(item => {
      const encodedName = item.description || '';
      const decodedName = order.productMapping ? decodeProductName(encodedName, order) : null;
      
      return {
        description: encodedName,
        decodedName,
        quantity: item.quantity || 0,
        amount: item.amount_total ? item.amount_total / 100 : 0, // Convert from cents to dollars
      };
    });
    
    return {
      stripeOrder: session,
      decodedItems
    };
  } catch (error) {
    console.error('Error fetching and decoding Stripe order:', error);
    return null;
  }
} 