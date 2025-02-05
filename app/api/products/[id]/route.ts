import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { getProductImage } from '@/lib/product-utils';
import { logger } from '@/lib/logger';

interface ProductResponse {
  id: string;
  name: string;
  description: string;
  images: string[];
  price: number;
  currency: string;
  metadata: Record<string, string>;
  category?: string;
  isPhysical?: boolean;
  isSubscription?: boolean;
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    logger.info('Fetching product details', { productId: params.id });

    const product = await stripe.products.retrieve(params.id, {
      expand: ['default_price']
    });

    if (!product || !product.default_price) {
      logger.warn('Product or price not found', { productId: params.id });
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const price = product.default_price as any;

    // Process and validate all product images
    const validatedImages = await Promise.all(
      product.images.map(async (image) => {
        const processedImage = getProductImage(image);
        return processedImage;
      })
    );

    const formattedProduct: ProductResponse = {
      id: product.id,
      name: product.name,
      description: product.description || '',
      images: validatedImages,
      price: price.unit_amount ? price.unit_amount / 100 : 0,
      currency: price.currency?.toUpperCase() || 'USD',
      metadata: product.metadata || {},
      category: product.metadata?.category,
      isPhysical: product.metadata?.type === 'physical',
      isSubscription: price.type === 'recurring'
    };

    logger.success('Successfully fetched product details', { 
      productId: params.id,
      imageCount: validatedImages.length
    });

    return NextResponse.json(formattedProduct);
  } catch (error) {
    logger.error('Error fetching product:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch product',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}