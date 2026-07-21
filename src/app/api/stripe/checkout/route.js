import { NextResponse } from 'next/server';
import { getStripeClient } from '@/lib/stripe';
import prisma from '@/lib/prisma';

export async function POST(req) {
  try {
    const body = await req.json();
    const {
      serviceId,
      serviceTitle,
      price,
      fullName,
      email,
      phone,
      websiteUrl,
      location,
      story,
      timeline,
      cancelUrl,
      successUrl,
    } = body;

    if (!fullName || !email || !serviceTitle) {
      return NextResponse.json(
        { success: false, error: 'Full name, email, and service title are required.' },
        { status: 400 }
      );
    }

    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey || secretKey.includes('placeholder')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Stripe is not configured yet. Please enter your valid STRIPE_SECRET_KEY in the .env file.',
        },
        { status: 400 }
      );
    }

    const siteId = process.env.NEXT_PUBLIC_SITE_ID || process.env.SITE_ID || 'AHP';

    // Parse amount into integer cents (e.g. "$599" -> 59900)
    let unitAmount = 19900; // default $199.00 fallback
    if (price) {
      const numericMatch = price.replace(/,/g, '').match(/\d+/);
      if (numericMatch) {
        const parsedDollars = parseInt(numericMatch[0], 10);
        if (!isNaN(parsedDollars) && parsedDollars > 0) {
          unitAmount = parsedDollars * 100;
        }
      }
    }

    const stripe = getStripeClient();
    const origin = req.headers.get('origin') || 'http://localhost:3000';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: serviceTitle,
              description: `Media & PR Service Booking for ${fullName}`,
            },
            unit_amount: unitAmount,
          },
          quantity: 1,
        },
      ],
      metadata: {
        siteId,
        serviceId: serviceId || '',
        serviceTitle,
        fullName,
        email,
        phone: phone || '',
        websiteUrl: websiteUrl || '',
        location: location || '',
        timeline: timeline || '',
        story: story ? story.substring(0, 450) : '',
      },
      success_url:
        successUrl ||
        `${origin}/services/${serviceId || 'booking'}?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${origin}/services?payment=cancelled`,
    });

    return NextResponse.json({
      success: true,
      url: session.url,
      sessionId: session.id,
    });
  } catch (err) {
    console.error('POST /api/stripe/checkout error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to create Stripe checkout session.' },
      { status: 500 }
    );
  }
}
