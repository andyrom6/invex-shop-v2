import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const endpoint = url.pathname.split('/api/')[1];

  switch (endpoint) {
    default:
      return new NextResponse('Endpoint not found', { status: 404 });
  }
}

export async function POST(request: Request) {
  const url = new URL(request.url);
  const endpoint = url.pathname.split('/api/')[1];

  switch (endpoint) {
    case 'cart/add': {
      try {
        const formData = await request.formData();
        const productId = formData.get('productId') as string;

        if (!productId) {
          return new NextResponse('Product ID is required', { status: 400 });
        }

        const product = await stripe.products.retrieve(productId);
        const prices = await stripe.prices.list({ product: productId });
        const price = prices.data[0];

        if (!product || !price) {
          return new NextResponse('Product not found', { status: 404 });
        }

        const cookieStore = cookies();
        const cartCookie = cookieStore.get('cart');
        const cart = cartCookie ? JSON.parse(cartCookie.value) : [];

        const existingItem = cart.find((item: any) => item.id === productId);
        if (existingItem) {
          existingItem.quantity += 1;
        } else {
          cart.push({
            id: product.id,
            name: product.name,
            price: price.unit_amount! / 100,
            currency: price.currency,
            image: product.images[0],
            quantity: 1,
          });
        }

        cookies().set('cart', JSON.stringify(cart));
        return new NextResponse('Product added to cart', { status: 200 });
      } catch (error) {
        console.error('Error adding to cart:', error);
        return new NextResponse('Error adding to cart', { status: 500 });
      }
    }

    case 'cart/remove': {
      try {
        const formData = await request.formData();
        const productId = formData.get('productId') as string;

        if (!productId) {
          return new NextResponse('Product ID is required', { status: 400 });
        }

        const cookieStore = cookies();
        const cartCookie = cookieStore.get('cart');
        const cart = cartCookie ? JSON.parse(cartCookie.value) : [];

        const updatedCart = cart.filter((item: any) => item.id !== productId);
        cookies().set('cart', JSON.stringify(updatedCart));

        return new NextResponse('Product removed from cart', { status: 200 });
      } catch (error) {
        console.error('Error removing from cart:', error);
        return new NextResponse('Error removing from cart', { status: 500 });
      }
    }

    case 'checkout': {
      try {
        const { items } = await request.json();

        if (!items?.length) {
          return NextResponse.json(
            { error: "Please provide items to checkout" },
            { status: 400 }
          );
        }

        const session = await stripe.checkout.sessions.create({
          payment_method_types: ["card"],
          line_items: items,
          mode: "payment",
          success_url: `${url.origin}/success`,
          cancel_url: `${url.origin}/cart`,
        });

        return NextResponse.json({ sessionId: session.id });
      } catch (error) {
        console.error("Error creating checkout session:", error);
        return NextResponse.json(
          { error: "Error creating checkout session" },
          { status: 500 }
        );
      }
    }

    default:
      return new NextResponse('Endpoint not found', { status: 404 });
  }
}
