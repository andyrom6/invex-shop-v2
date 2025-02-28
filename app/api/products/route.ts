import { NextResponse } from 'next/server';
import { db, storage } from '@/lib/firebase';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { logger } from '@/lib/logger';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export async function GET() {
  try {
    const productsRef = collection(db, 'products');
    const snapshot = await getDocs(productsRef);
    const products = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    return NextResponse.json(products);
  } catch (error) {
    logger.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const images = formData.getAll('images');
    
    // Upload images to Firebase Storage
    const imageUrls = await Promise.all(
      images.map(async (image) => {
        // Check if image is a File object
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

    const productData = {
      name: formData.get('name'),
      description: formData.get('description'),
      price: parseFloat(formData.get('price') as string),
      currency: formData.get('currency'),
      images: imageUrls,
      metadata: metadata,
      stock: parseInt(formData.get('stock') as string),
      createdAt: new Date().toISOString(),
      featured: formData.get('featured') === 'true',
      onSale: formData.get('onSale') === 'true',
      salePrice: formData.get('salePrice') ? parseFloat(formData.get('salePrice') as string) : undefined,
    };

    const productsRef = collection(db, 'products');
    const docRef = await addDoc(productsRef, productData);
    
    return NextResponse.json({ id: docRef.id, ...productData });
  } catch (error) {
    logger.error('Error creating product:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
