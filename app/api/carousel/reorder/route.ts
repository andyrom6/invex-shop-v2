import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, doc, getDoc, getDocs, query, orderBy, updateDoc, writeBatch } from 'firebase/firestore';
import { logger } from '@/lib/logger';

interface CarouselImage {
  id: string;
  src: string;
  alt: string;
  caption: string;
  storagePath?: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, direction } = body;
    
    if (!id || !direction || (direction !== 'up' && direction !== 'down')) {
      logger.warn('Invalid reorder request parameters');
      return NextResponse.json(
        { error: 'Invalid parameters' },
        { status: 400 }
      );
    }
    
    logger.info(`Reordering carousel image ${id} ${direction}`);
    
    // Get all carousel images ordered by their current order
    const carouselRef = collection(db, 'carousel');
    const q = query(carouselRef, orderBy('order', 'asc'));
    const snapshot = await getDocs(q);
    
    const images = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as CarouselImage[];
    
    // Find the current image and its index
    const currentIndex = images.findIndex(img => img.id === id);
    if (currentIndex === -1) {
      logger.warn(`Carousel image ${id} not found`);
      return NextResponse.json(
        { error: 'Image not found' },
        { status: 404 }
      );
    }
    
    // Calculate the target index based on direction
    let targetIndex;
    if (direction === 'up') {
      targetIndex = currentIndex - 1;
      if (targetIndex < 0) {
        logger.warn(`Cannot move image ${id} up as it's already at the top`);
        return NextResponse.json(
          { error: 'Cannot move image up' },
          { status: 400 }
        );
      }
    } else {
      targetIndex = currentIndex + 1;
      if (targetIndex >= images.length) {
        logger.warn(`Cannot move image ${id} down as it's already at the bottom`);
        return NextResponse.json(
          { error: 'Cannot move image down' },
          { status: 400 }
        );
      }
    }
    
    // Swap the order values
    const currentImage = images[currentIndex];
    const targetImage = images[targetIndex];
    
    const batch = writeBatch(db);
    
    // Update the current image's order
    const currentImageRef = doc(db, 'carousel', currentImage.id);
    batch.update(currentImageRef, { 
      order: targetImage.order,
      updatedAt: new Date().toISOString()
    });
    
    // Update the target image's order
    const targetImageRef = doc(db, 'carousel', targetImage.id);
    batch.update(targetImageRef, { 
      order: currentImage.order,
      updatedAt: new Date().toISOString()
    });
    
    // Commit the batch
    await batch.commit();
    
    logger.info(`Successfully reordered carousel image ${id} ${direction}`);
    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Error reordering carousel images:', error);
    return NextResponse.json(
      { error: 'Failed to reorder images' },
      { status: 500 }
    );
  }
} 