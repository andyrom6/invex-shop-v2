import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { logger } from '@/lib/logger';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const docRef = doc(db, 'products', params.id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ id: docSnap.id, ...docSnap.data() });
  } catch (error) {
    logger.error('Error fetching product:', error);
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await deleteDoc(doc(db, 'products', params.id));
    return NextResponse.json({ message: 'Product deleted successfully' });
  } catch (error) {
    logger.error('Error deleting product:', error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const formData = await request.formData();
    const newImages = formData.getAll('images');
    
    // Parse metadata from JSON string
    let metadata;
    try {
      metadata = JSON.parse(formData.get('metadata') as string);
    } catch (error) {
      // Fallback if metadata isn't a valid JSON string
      metadata = {
        category: formData.get('category') || '',
        type: formData.get('type') || 'physical',
        delivery: formData.get('delivery') || 'shipping',
      };
    }

    // Get current product data to merge with updates
    const docRef = doc(db, 'products', params.id);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    
    const currentProduct = docSnap.data();
    
    // Get existing images from the request or use current ones
    let existingImages: string[] = [];
    try {
      const existingImagesJson = formData.get('existingImages');
      if (existingImagesJson) {
        existingImages = JSON.parse(existingImagesJson as string);
      }
    } catch (error) {
      logger.error('Error parsing existing images:', error);
      existingImages = currentProduct.images || [];
    }
    
    // Handle new image uploads
    const newImageUrls = await Promise.all(
      newImages.map(async (image) => {
        if (image instanceof File) {
          try {
            const storageRef = ref(storage, `products/${Date.now()}-${image.name}`);
            const snapshot = await uploadBytes(storageRef, image);
            return getDownloadURL(snapshot.ref);
          } catch (error) {
            logger.error('Error uploading image:', error);
            return ''; // Return empty string if upload fails
          }
        } else {
          // If it's already a URL string, return it
          return String(image);
        }
      }).filter(url => url) // Filter out empty strings
    );
    
    // Combine existing and new images
    const imageUrls = [...existingImages, ...newImageUrls];

    const productData = {
      name: formData.get('name'),
      description: formData.get('description'),
      price: parseFloat(formData.get('price') as string),
      currency: formData.get('currency'),
      images: imageUrls,
      metadata: metadata,
      stock: parseInt(formData.get('stock') as string),
      featured: formData.get('featured') === 'true',
      onSale: formData.get('onSale') === 'true',
      salePrice: formData.get('salePrice') ? parseFloat(formData.get('salePrice') as string) : undefined,
      // Keep the original creation date
      createdAt: currentProduct.createdAt,
    };

    await updateDoc(docRef, productData);
    return NextResponse.json({ 
      message: 'Product updated successfully',
      id: params.id,
      ...productData
    });
  } catch (error) {
    logger.error('Error updating product:', error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}