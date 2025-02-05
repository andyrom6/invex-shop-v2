import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { isSubscriptionProduct } from '@/lib/product-utils';
import { ProductMetadata, CartItem } from '@/types/product';
import { z } from 'zod';

// Validation schemas
// Define ProductMetadata schema to match your type
const ProductMetadataSchema = z.object({
  category: z.string().optional(),
  type: z.string().optional(),
  delivery: z.string().optional(),
  isSubscription: z.string().optional(),
  requires_shipping: z.string().optional()
});

const CartActionSchema = z.object({
  action: z.enum(['add', 'remove', 'update-quantity']),
  item: z.object({
    id: z.string(),
    name: z.string(),
    price: z.number().positive(),
    currency: z.string(),
    quantity: z.number().min(0),
    image: z.string(),
    metadata: ProductMetadataSchema
  })
});

function parseCartData(cartData: string | null): CartItem[] {
  if (!cartData) return [];
  try {
    const cart = JSON.parse(cartData);
    return Array.isArray(cart) ? cart : [];
  } catch (e) {
    console.error('Error parsing cart data:', e);
    return [];
  }
}

export async function GET(request: Request) {
  try {
    const cartData = cookies().get('cart')?.value ?? null;
    return NextResponse.json(parseCartData(cartData));
  } catch (error) {
    console.error('Error fetching cart:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cart' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate request body
    const result = CartActionSchema.safeParse(body);
    if (!result.success) {
      console.error('[CART_VALIDATION_ERROR]', result.error);
      return NextResponse.json(
        { error: 'Invalid request format', details: result.error.format() },
        { status: 400 }
      );
    }
    
    const { action, item } = result.data;
    
    // Get current cart
    const cartData = cookies().get('cart')?.value ?? null;
    let cart = parseCartData(cartData);

    switch (action) {
      case 'add': {
        const isSubscription = isSubscriptionProduct(item.metadata as ProductMetadata);

        if (isSubscription) {
          const hasSubscription = cart.some(cartItem => 
            isSubscriptionProduct(cartItem.metadata as ProductMetadata)
          );
          
          if (hasSubscription) {
            return NextResponse.json(
              { error: 'Only one subscription product can be added to cart' },
              { status: 400 }
            );
          }
        }

        const existingItemIndex = cart.findIndex(cartItem => cartItem.id === item.id);
        
        if (existingItemIndex !== -1) {
          if (!isSubscription) {
            cart[existingItemIndex].quantity += 1;
          }
        } else {
          cart.push(item);
        }
        break;
      }

      case 'remove': {
        cart = cart.filter(cartItem => cartItem.id !== item.id);
        break;
      }

      case 'update-quantity': {
        const itemIndex = cart.findIndex(cartItem => cartItem.id === item.id);
        if (itemIndex !== -1) {
          if (item.quantity === 0) {
            cart.splice(itemIndex, 1);
          } else {
            cart[itemIndex].quantity = item.quantity;
          }
        }
        break;
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    // Create response with updated cart
    const response = NextResponse.json({
      message: 'Cart updated successfully',
      cart,
    });

    // Set cookie in response
    cookies().set('cart', JSON.stringify(cart), {
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      httpOnly: true,
    });

    return response;

  } catch (error) {
    console.error('Cart operation error:', error);
    return NextResponse.json(
      { error: 'Failed to update cart' },
      { status: 500 }
    );
  }
}