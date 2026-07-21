import { NextResponse } from 'next/server';
import { getStripeClient } from '@/lib/stripe';
import prisma from '@/lib/prisma';

export async function POST(req) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  try {
    const rawBody = await req.text();
    const signature = req.headers.get('stripe-signature');

    let event;
    const stripe = getStripeClient();

    if (webhookSecret && webhookSecret !== 'whsec_placeholder' && signature) {
      try {
        event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
      } catch (err) {
        console.error('Stripe webhook signature verification failed:', err.message);
        return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 });
      }
    } else {
      // In development mode or unconfigured webhook secret, parse raw payload directly
      event = JSON.parse(rawBody);
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const meta = session.metadata || {};

      const siteId = meta.siteId || process.env.NEXT_PUBLIC_SITE_ID || 'AHP';
      const fullName = meta.fullName || session.customer_details?.name || 'Stripe Customer';
      const email = meta.email || session.customer_email || session.customer_details?.email || '';
      const serviceTitle = meta.serviceTitle || 'Paid Service Package';
      const amountPaid = session.amount_total ? (session.amount_total / 100).toFixed(2) : '0.00';

      const notesText = `
PAID STRIPE BOOKING ($${amountPaid}):
Service: ${serviceTitle}
Professional Title: ${meta.professionalTitle || 'N/A'}
Website: ${meta.websiteUrl || 'N/A'}
Phone: ${meta.phone || 'N/A'}
Location: ${meta.location || 'N/A'}
Timeline: ${meta.timeline || 'N/A'}
Story: ${meta.story || 'N/A'}
Stripe Session ID: ${session.id}
      `;

      // 1. Create Lead in Prisma marked as won/paid
      const lead = await prisma.lead.create({
        data: {
          siteId,
          name: fullName,
          email,
          phone: meta.phone || '',
          serviceInterest: serviceTitle,
          sourcePage: 'Stripe Checkout',
          status: 'won',
          notes: notesText,
        },
      });

      // 2. Create ContactFormSubmission
      await prisma.contactFormSubmission.create({
        data: {
          siteId,
          name: fullName,
          email,
          phone: meta.phone || '',
          message: notesText,
          status: 'processed',
        },
      });

      // 3. Create Dashboard Notification Alert for Topbar / CRM Notification Bell
      try {
        await prisma.notificationAlert.create({
          data: {
            siteId,
            title: `Paid Service Booking ($${amountPaid})`,
            message: `${fullName} paid $${amountPaid} for ${serviceTitle}`,
            type: 'NEW_LEAD',
          },
        });
      } catch (alertErr) {
        console.error('Failed to create notification alert for Stripe payment:', alertErr);
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('POST /api/stripe/webhook error:', err);
    return NextResponse.json({ error: 'Webhook processing error', message: err.message }, { status: 500 });
  }
}
