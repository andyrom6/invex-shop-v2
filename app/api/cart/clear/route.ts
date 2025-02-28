import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    // Clear the cart cookie
    cookies().set('cart', '', {
      path: '/',
      maxAge: 0, // Expire immediately
      expires: new Date(0), // Expire immediately
    });
    
    console.log('Cart cookie cleared');
    
    return NextResponse.json({ 
      message: 'Cart cleared successfully',
      cart: []
    });
  } catch (error) {
    console.error('Error clearing cart:', error);
    return NextResponse.json(
      { error: 'Failed to clear cart' },
      { status: 500 }
    );
  }
} 