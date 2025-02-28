import { NextRequest, NextResponse } from 'next/server';
import { db, storage } from '@/lib/firebase';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';
import { logger } from '@/lib/logger';

interface Params {
  params: {
    id: string;
  };
}

// Update carousel image details
export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { id } = params;
    const body = await request.json();
    const { alt, caption } = body;

    logger.info(`Updating carousel image ${id}`);

    // Validate the image exists
    const imageRef = doc(db, 'carousel', id);
    const imageDoc = await getDoc(imageRef);

    if (!imageDoc.exists()) {
      logger.warn(`Carousel image ${id} not found`);
      return NextResponse.json(
        { error: 'Carousel image not found' },
        { status: 404 }
      );
    }

    // Update the image details
    await updateDoc(imageRef, {
      alt: alt || '',
      caption: caption || '',
      updatedAt: new Date().toISOString(),
    });

    logger.info(`Carousel image ${id} updated successfully`);
    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error(`Error updating carousel image:`, error);
    return NextResponse.json(
      { error: 'Failed to update carousel image' },
      { status: 500 }
    );
  }
}

// Delete carousel image
export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    const { id } = params;
    logger.info(`Deleting carousel image ${id}`);

    // Validate the image exists
    const imageRef = doc(db, 'carousel', id);
    const imageDoc = await getDoc(imageRef);

    if (!imageDoc.exists()) {
      logger.warn(`Carousel image ${id} not found`);
      return NextResponse.json(
        { error: 'Carousel image not found' },
        { status: 404 }
      );
    }

    const imageData = imageDoc.data();
    
    // Delete the image file from storage if it exists
    if (imageData.storagePath) {
      const storageRef = ref(storage, imageData.storagePath);
      await deleteObject(storageRef);
      logger.info(`Deleted image file from storage: ${imageData.storagePath}`);
    }

    // Delete the document from Firestore
    await deleteDoc(imageRef);
    logger.info(`Carousel image ${id} deleted successfully`);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error(`Error deleting carousel image:`, error);
    return NextResponse.json(
      { error: 'Failed to delete carousel image' },
      { status: 500 }
    );
  }
} 