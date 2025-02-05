import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import Stripe from 'stripe';

export async function GET() {
  try {
    const allProducts: Stripe.Product[] = [];
    let hasMore = true;
    let startingAfter: string | undefined;
    
    // Fetch all products using pagination
    while (hasMore) {
      const products = await stripe.products.list({
        limit: 100, // Maximum allowed by Stripe
        starting_after: startingAfter,
        active: true, // Only fetch active products
      });
      
      allProducts.push(...products.data);
      hasMore = products.has_more;
      startingAfter = products.data[products.data.length - 1]?.id;
    }

    console.log(`Fetched ${allProducts.length} products from Stripe`);
    
    const productsWithPrices = await Promise.all(
      allProducts.map(async (product) => {
        console.log('Processing product:', {
          name: product.name,
          metadata: {
            category: product.metadata.category,
            type: product.metadata.type,
            delivery: product.metadata.delivery
          }
        });
        
        // Fetch prices for each product
        const prices = await stripe.prices.list({ 
          product: product.id,
          active: true, // Only fetch active prices
          limit: 1 // We only need the first price
        });
        
        const price = prices.data[0];
        if (!price) {
          console.warn(`No active price found for product: ${product.name} (${product.id})`);
          return null;
        }

        return {
          id: product.id,
          name: product.name,
          description: product.description || '',
          price: price.unit_amount! / 100,
          currency: price.currency,
          image: product.images[0] || '',
          category: product.metadata.category,
          type: product.metadata.type,
          delivery: product.metadata.delivery,
          isSubscription: product.metadata.isSubscription === 'true',
        };
      })
    );

    // Filter out any null values (products without prices)
    const validProducts = productsWithPrices.filter((product): product is NonNullable<typeof product> => product !== null);
    
    return NextResponse.json(validProducts);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}
