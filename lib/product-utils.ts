import { ProductMetadata } from '@/types/product';

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

export function formatPrice(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
}

export function calculateTotal(items: { price: number; quantity: number }[]): number {
  return items.reduce((total, item) => total + (item.price * item.quantity), 0);
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

export function validateProductImage(image: string): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = image;
  });
}