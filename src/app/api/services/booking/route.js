import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sendEmail } from '@/lib/email';

export async function POST(req) {
  try {
    const body = await req.json();
    const {
      fullName,
      professionalTitle,
      email,
      websiteUrl,
      phone,
      location,
      mediaPackage,
      timeline,
      story
    } = body;

    if (!fullName || !email || !mediaPackage || !timeline || !story) {
      return NextResponse.json({ success: false, error: 'Required fields are missing' }, { status: 400 });
    }

    const ip = req.headers.get("x-forwarded-for") || "unknown";
    const { checkRateLimit } = await import("@/lib/rateLimiter");
    const allowed = await checkRateLimit(ip, 10);
    if (!allowed) {
      return NextResponse.json({ success: false, error: 'Too Many Requests: Rate limit exceeded' }, { status: 429 });
    }

    // Use the configured site ID from environment
    const siteId = process.env.NEXT_PUBLIC_SITE_ID || process.env.SITE_ID || 'AHP';

    const messageText = `
Professional Title: ${professionalTitle || 'N/A'}
Company/Practice Website: ${websiteUrl || 'N/A'}
Phone: ${phone || 'N/A'}
State & Country: ${location || 'N/A'}
Requested Media Package: ${mediaPackage}
Desired Timeline: ${timeline}
About Story / Brand Mission: ${story}
    `;

    // 1. Create ContactFormSubmission
    const submission = await prisma.contactFormSubmission.create({
      data: {
        siteId,
        name: fullName,
        email,
        phone: phone || '',
        message: `MEDIA PACKAGE BOOKING REQUEST:\n${messageText}`,
        status: 'new'
      }
    });

    // 2. Create Lead for CRM tracking — use consistent sourcePage for CRM filter
    const lead = await prisma.lead.create({
      data: {
        siteId,
        name: fullName,
        email,
        phone: phone || '',
        serviceInterest: mediaPackage,
        sourcePage: 'Services Booking Form',
        status: 'new',
        notes: messageText
      }
    });

    // 3. Email to the team
    try {
      await sendEmail({
        siteId,
        to: 'info@ahealthplace.com',
        subject: `New Media Booking Request: ${fullName} - ${mediaPackage}`,
        text: `You have received a new media package inquiry:\n\nClient: ${fullName}\nEmail: ${email}\n${messageText}`,
        html: `
          <div style="font-family: sans-serif; padding: 20px; color: #333;">
            <h2 style="color: #0f4c4e; border-bottom: 2px solid #0f4c4e; padding-pb: 8px;">New Media Booking Request</h2>
            <p><strong>Client Name:</strong> ${fullName}</p>
            <p><strong>Email Address:</strong> ${email}</p>
            <p><strong>Phone Number:</strong> ${phone || 'N/A'}</p>
            <p><strong>Professional Title:</strong> ${professionalTitle || 'N/A'}</p>
            <p><strong>Website:</strong> ${websiteUrl || 'N/A'}</p>
            <p><strong>Location (State & Country):</strong> ${location || 'N/A'}</p>
            <p><strong>Requested Media Package:</strong> ${mediaPackage}</p>
            <p><strong>Timeline:</strong> ${timeline}</p>
            <h3 style="color: #0f4c4e; margin-top: 20px;">Story / Brand Mission:</h3>
            <p style="background: #f7f9f9; padding: 15px; border-radius: 8px; border-left: 4px solid #1c7b80;">
              ${story.replace(/\n/g, '<br />')}
            </p>
          </div>
        `
      });
    } catch (emailErr) {
      console.error('Failed to send notification email to team:', emailErr);
      // Do not fail request if email failed, as database save succeeded
    }

    return NextResponse.json({ success: true, submissionId: submission.id, leadId: lead.id });
  } catch (err) {
    console.error('POST /api/services/booking error:', err);
    return NextResponse.json({ success: false, error: 'Internal Server Error', message: err.message }, { status: 500 });
  }
}
