import { NextRequest, NextResponse } from 'next/server';
import { getOrderByReference } from '@/lib/orders';
import { db } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const { orderReference, email } = await request.json();

    if (!orderReference || !email) {
      return NextResponse.json(
        { error: 'Missing required parameters: orderReference and email' },
        { status: 400 }
      );
    }

    // Get the order by reference
    const order = await getOrderByReference(orderReference);
    
    if (!order || !order.id) {
      return NextResponse.json(
        { error: `Order with reference ${orderReference} not found` },
        { status: 404 }
      );
    }

    // Update the order with the new email
    const docRef = doc(db, 'orders', order.id);
    await updateDoc(docRef, {
      customerEmail: email
    });

    logger.info(`Updated email for order ${orderReference} to ${email}`);

    return NextResponse.json({ 
      success: true,
      message: `Email for order ${orderReference} updated to ${email}`
    });
  } catch (error) {
    logger.error('Error updating order email:', error);
    return NextResponse.json(
      { error: 'Failed to update order email' },
      { status: 500 }
    );
  }
} 