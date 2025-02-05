import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { getProductImage } from '@/lib/product-utils';
import { logger } from '@/lib/logger';

export async function GET() {
  try {
    // Specific product IDs we want to feature
    const featuredProductIds = [
      'prod_RhcB88XtediBu0',
      'prod_RhtGRum3WLrWtC'
    ];

    logger.info('Fetching featured products', { productIds: featuredProductIds });

    const products = await Promise.all(
      featuredProductIds.map(async (productId) => {
        try {
          const product = await stripe.products.retrieve(productId);
          const prices = await stripe.prices.list({
            product: productId,
            active: true,
            limit: 1
          });

          const price = prices.data[0];
          if (!price) {
            logger.warn('No active price found for product', { productId });
            return null;
          }

          // Get and validate the product image
          const productImage = getProductImage(product.images[0]);

          return {
            id: product.id,
            name: product.name,
            description: product.description || '',
            price: price.unit_amount! / 100,
            currency: price.currency,
            image: productImage,
            category: product.metadata.category,
            type: product.metadata.type,
            delivery: product.metadata.delivery,
            isSubscription: product.metadata.isSubscription === 'true',
          };
        } catch (error) {
          logger.error(`Error fetching product ${productId}:`, error);
          return null;
        }
      })
    );

    const validProducts = products.filter((product): product is NonNullable<typeof product> => product !== null);
    
    logger.success('Successfully fetched featured products', { 
      count: validProducts.length 
    });

    return NextResponse.json(validProducts);
  } catch (error) {
    logger.error('Error fetching featured products:', error);
    return new NextResponse(JSON.stringify({ error: 'Failed to fetch featured products' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}