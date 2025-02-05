import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { stripe } from '@/lib/stripe'
import { logger } from '@/lib/logger'
import { headers } from 'next/headers'
import { isPhysicalProduct } from '@/lib/product-utils'

// Cache for rate limiting
const requestCache = new Map<string, { timestamp: number, count: number }>()

// Rate limit configuration
const RATE_LIMIT = {
  windowMs: 60000, // 1 minute
  max: 10 // max requests per window
}

// Timeouts
const TIMEOUTS = {
  REQUEST_PARSE: 5000,     // 5 seconds
  STRIPE_SESSION: 10000,   // 10 seconds
  RETRY_DELAY: 1000,       // 1 second
}

const isRateLimited = (clientIp: string): boolean => {
  const now = Date.now()
  const clientRequests = requestCache.get(clientIp)

  if (!clientRequests) {
    requestCache.set(clientIp, { timestamp: now, count: 1 })
    return false
  }

  if (now - clientRequests.timestamp > RATE_LIMIT.windowMs) {
    requestCache.set(clientIp, { timestamp: now, count: 1 })
    return false
  }

  if (clientRequests.count >= RATE_LIMIT.max) {
    return true
  }

  clientRequests.count++
  return false
}

const createStripeSession = async (config: Stripe.Checkout.SessionCreateParams): Promise<Stripe.Checkout.Session> => {
  let session: Stripe.Checkout.Session | null = null
  let error: any = null
  let attempts = 0
  const maxAttempts = 2 // Reduced to 2 attempts for faster response

  while (!session && attempts < maxAttempts) {
    attempts++
    try {
      logger.info(`Creating Stripe session (attempt ${attempts})`)
      session = await Promise.race([
        stripe.checkout.sessions.create(config),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Session creation timeout')), TIMEOUTS.STRIPE_SESSION)
        )
      ]) as Stripe.Checkout.Session
      break // Success, exit loop
    } catch (e) {
      error = e
      if (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, TIMEOUTS.RETRY_DELAY))
      }
    }
  }

  if (!session) throw error || new Error('Failed to create session')
  return session
}

export async function POST(request: Request) {
  const checkoutTimer = logger.time('Checkout Process')
  const headersList = headers()
  const clientIp = headersList.get('x-forwarded-for') || 'unknown'

  try {
    // Rate limiting
    if (isRateLimited(clientIp)) {
      logger.warn('Rate limit exceeded', { clientIp })
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      )
    }

    // Parse request body
    const body = await request.json()
    if (!body.items?.length) {
      return NextResponse.json(
        { error: 'No items provided' },
        { status: 400 }
      )
    }

    // Analyze cart contents
    const hasPhysicalProducts = body.items.some((item: any) => 
      isPhysicalProduct(item.price_data.product_data.metadata)
    )

    // Prepare base session config
    const sessionConfig: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ['card'],
      line_items: body.items,
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/cart`,
      expires_at: Math.floor(Date.now() / 1000) + 1800, // 30 minutes
      customer_creation: 'always',
      payment_intent_data: {
        capture_method: 'automatic',
      },
      locale: 'en',
      submit_type: 'pay',
      billing_address_collection: 'auto',
    }

    // Add shipping configuration only for physical products
    if (hasPhysicalProducts) {
      sessionConfig.shipping_address_collection = {
        allowed_countries: ['US'], // Only allow US shipping
      }
      sessionConfig.shipping_options = [
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: { amount: 1500, currency: 'usd' }, // $15 flat rate shipping
            display_name: 'Standard Shipping',
            delivery_estimate: {
              minimum: { unit: 'business_day', value: 3 },
              maximum: { unit: 'business_day', value: 5 },
            },
          },
        }
      ]
      sessionConfig.automatic_tax = { enabled: true }
    }

    // Create session with retry logic
    const session = await createStripeSession(sessionConfig)
    
    logger.success('Checkout session created', {
      sessionId: session.id,
      duration: checkoutTimer()
    })

    return NextResponse.json({ sessionId: session.id })

  } catch (error: any) {
    logger.error('Checkout failed', error)
    checkoutTimer()

    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}