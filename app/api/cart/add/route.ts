import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { CartItem } from '@/types/product';

export async function POST(request: Request) {
  try {
    // Get form data
    const formData = await request.formData();
    
    // Extract product data
    const id = formData.get('id') as string;
    const name = formData.get('name') as string;
    const price = parseFloat(formData.get('price') as string);
    const currency = formData.get('currency') as string;
    const image = formData.get('image') as string;
    const category = formData.get('category') as string;
    const type = formData.get('type') as string;
    const delivery = formData.get('delivery') as string;
    const onSale = formData.get('onSale') === 'true';
    const salePrice = formData.get('salePrice') ? parseFloat(formData.get('salePrice') as string) : undefined;
    
    // Get current cart
    const cartData = cookies().get('cart')?.value ?? null;
    let cart: CartItem[] = [];
    
    try {
      if (cartData) {
        cart = JSON.parse(cartData);
        if (!Array.isArray(cart)) cart = [];
      }
    } catch (e) {
      console.error('Error parsing cart data:', e);
      cart = [];
    }
    
    // Check if item already exists in cart
    const existingItemIndex = cart.findIndex(item => item.id === id);
    
    if (existingItemIndex !== -1) {
      // Update quantity if item exists
      cart[existingItemIndex].quantity += 1;
    } else {
      // Add new item to cart
      const cartItem: CartItem = {
        id,
        name,
        price: onSale && salePrice ? salePrice : price,
        originalPrice: onSale && salePrice ? price : undefined,
        currency,
        image,
        quantity: 1,
        onSale,
        salePrice,
        metadata: {
          category,
          type: type as 'physical' | 'digital',
          delivery: delivery as 'shipping' | 'download',
        }
      };
      
      cart.push(cartItem);
    }
    
    // Set cookie with updated cart
    console.log('Setting cart cookie with data:', JSON.stringify(cart));
    
    try {
      cookies().set('cart', JSON.stringify(cart), {
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 1 week
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        httpOnly: true,
      });
      console.log('Cookie set successfully');
    } catch (cookieError) {
      console.error('Error setting cookie:', cookieError);
    }
    
    // Redirect to cart page with cart data in query params as a fallback
    const params = new URLSearchParams();
    params.set('cartData', JSON.stringify(cart));
    
    return NextResponse.redirect(new URL(`/cart?${params.toString()}`, request.url));
    
  } catch (error) {
    console.error('Error adding to cart:', error);
    return NextResponse.redirect(new URL('/product', request.url));
  }
} 