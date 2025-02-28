import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { logger } from '@/lib/logger';

export async function GET() {
  try {
    logger.info('Fetching carousel images');
    
    const carouselRef = collection(db, 'carousel');
    const q = query(carouselRef, orderBy('order', 'asc'));
    const snapshot = await getDocs(q);
    
    const images = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    
    logger.info(`Retrieved ${images.length} carousel images`);
    return NextResponse.json(images);
  } catch (error) {
    logger.error('Error fetching carousel images:', error);
    return NextResponse.json(
      { error: 'Failed to fetch carousel images' },
      { status: 500 }
    );
  }
} 