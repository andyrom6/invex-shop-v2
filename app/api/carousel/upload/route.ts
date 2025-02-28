import { NextRequest, NextResponse } from 'next/server';
import { db, storage } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, orderBy } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    logger.info('Processing carousel image upload');
    
    // Parse the multipart form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      logger.warn('No file provided in upload request');
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      logger.warn(`Invalid file type: ${file.type}`);
      return NextResponse.json(
        { error: 'Only image files are allowed' },
        { status: 400 }
      );
    }
    
    // Generate a unique filename
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const fileName = `carousel_${timestamp}.${fileExtension}`;
    const storagePath = `carousel/${fileName}`;
    
    // Upload the file to Firebase Storage
    const storageRef = ref(storage, storagePath);
    const fileBuffer = await file.arrayBuffer();
    await uploadBytes(storageRef, fileBuffer, {
      contentType: file.type,
    });
    
    // Get the download URL
    const downloadURL = await getDownloadURL(storageRef);
    
    // Determine the order (place new image at the end)
    const carouselRef = collection(db, 'carousel');
    const q = query(carouselRef, orderBy('order', 'desc'));
    const snapshot = await getDocs(q);
    const highestOrder = snapshot.docs.length > 0 ? snapshot.docs[0].data().order : 0;
    const newOrder = highestOrder + 1;
    
    // Add the image to Firestore
    const newImage = {
      src: downloadURL,
      alt: file.name.split('.')[0] || 'Carousel image',
      caption: file.name.split('.')[0] || 'Carousel image',
      storagePath,
      order: newOrder,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    const docRef = await addDoc(carouselRef, newImage);
    logger.info(`Carousel image uploaded successfully with ID: ${docRef.id}`);
    
    return NextResponse.json({
      success: true,
      id: docRef.id,
      ...newImage,
    });
  } catch (error) {
    logger.error('Error uploading carousel image:', error);
    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    );
  }
} 