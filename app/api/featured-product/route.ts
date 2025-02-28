import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { logger } from '@/lib/logger';

export async function GET() {
  try {
    // Get featured products from Firebase
    const productsRef = collection(db, 'products');
    const snapshot = await getDocs(productsRef);
    
    const featuredProducts = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter((product: any) => product.featured === true);

    logger.success('Fetched featured products', { count: featuredProducts.length });
    
    return NextResponse.json(featuredProducts);
  } catch (error) {
    logger.error('Error fetching featured products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch featured products' },
      { status: 500 }
    );
  }
}