import { ProductMetadata } from '@/types/product';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, runTransaction } from 'firebase/firestore';
import { logger } from '@/lib/logger';
import { OrderItem } from './orders';

export function isSubscriptionProduct(metadata: ProductMetadata): boolean {
  return metadata.isSubscription === 'true';
}

export function isPhysicalProduct(metadata: ProductMetadata): boolean {
  const type = metadata.type?.toLowerCase() ?? '';
  const category = metadata.category?.toLowerCase() ?? '';
  const delivery = metadata.delivery?.toLowerCase() ?? '';

  return (
    type === 'physical' ||
    metadata.requires_shipping === 'true' ||
    category === 'cologne' ||
    delivery.includes('days')
  );
}

export function getProductImage(image: string | undefined): string {
  // Default fallback image
  const fallbackImage = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1000&auto=format&fit=crop';

  if (!image) return fallbackImage;

  // Check if image is a File API URL
  if (image.startsWith('blob:') || image.startsWith('data:')) {
    return fallbackImage;
  }

  // Check if image is a relative path
  if (image.startsWith('/')) {
    return `${process.env.NEXT_PUBLIC_APP_URL}${image}`;
  }

  // Check if image is already a full URL
  try {
    new URL(image);
    return image;
  } catch {
    return fallbackImage;
  }
}

/**
 * Update product stock after a successful order
 * @param orderItems Array of order items with product IDs and quantities
 * @returns Object with success status and any errors
 */
export async function updateProductStock(orderItems: OrderItem[]): Promise<{
  success: boolean;
  errors?: string[];
}> {
  try {
    const errors: string[] = [];
    
    // Use a transaction to ensure all stock updates are atomic
    await runTransaction(db, async (transaction) => {
      // Process each order item
      for (const item of orderItems) {
        const productId = item.id;
        const quantity = item.quantity;
        
        if (!productId || !quantity) {
          errors.push(`Invalid product ID or quantity for item: ${item.name}`);
          continue;
        }
        
        // Get the product document
        const productRef = doc(db, 'products', productId);
        const productDoc = await transaction.get(productRef);
        
        if (!productDoc.exists()) {
          errors.push(`Product not found: ${productId}`);
          continue;
        }
        
        const productData = productDoc.data();
        const currentStock = productData.stock || 0;
        
        // Calculate new stock level
        const newStock = Math.max(0, currentStock - quantity);
        
        // Log if we're out of stock
        if (newStock === 0) {
          logger.warn(`Product ${productData.name} (${productId}) is now out of stock`);
        } else if (newStock < 5) {
          logger.warn(`Product ${productData.name} (${productId}) is running low: ${newStock} remaining`);
        }
        
        // Update the product stock
        transaction.update(productRef, { stock: newStock });
        
        logger.info(`Updated stock for product ${productId}: ${currentStock} → ${newStock}`);
      }
    });
    
    return {
      success: true,
      errors: errors.length > 0 ? errors : undefined
    };
  } catch (error) {
    logger.error('Error updating product stock:', error);
    return {
      success: false,
      errors: ['Failed to update product stock']
    };
  }
}