import nodemailer from "nodemailer";
import { Resend } from "resend";
import prisma from "@/lib/prisma";
import { BaseService } from "@/core/service";

export class EmailService extends BaseService {
  constructor() {
    super({ modelName: "globalSettings" });
  }

  async getTransporterForSite(siteId) {
    const settings = await prisma.globalSettings.findUnique({
      where: { siteId },
      select: { emailSettings: true },
    });

    const emailConfig = settings?.emailSettings || {};
    const provider = emailConfig.provider || "smtp";

    // Resend provider
    if (provider === "resend") {
      const apiKey = emailConfig.resendApiKey;
      if (!apiKey) {
        throw new Error(`Resend API key is not configured for site: ${siteId}`);
      }
      const resend = new Resend(apiKey);
      return {
        transporter: {
          sendMail: async ({ from, to, subject, text, html }) => {
            const payload = {
              from,
              to,
              subject,
              ...(html ? { html } : { text }),
            };
            const { error } = await resend.emails.send(payload);
            if (error) throw new Error(error.message);
          },
        },
        fromEmail: emailConfig.formEmail || "",
        config: emailConfig,
      };
    }

    // SendGrid provider
    if (provider === "sendgrid") {
      const apiKey = emailConfig.sendgridApiKey;
      if (!apiKey) {
        throw new Error(`SendGrid API key is not configured for site: ${siteId}`);
      }
      return {
        transporter: {
          sendMail: async ({ from, to, subject, text, html }) => {
            const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`,
              },
              body: JSON.stringify({
                personalizations: [
                  {
                    to: [{ email: to }],
                  },
                ],
                from: {
                  email: from || emailConfig.formEmail || "noreply@yourdomain.com",
                },
                subject,
                content: [
                  ...(text ? [{ type: "text/plain", value: text }] : []),
                  ...(html ? [{ type: "text/html", value: html }] : []),
                ],
              }),
            });
            if (!response.ok) {
              const errData = await response.json().catch(() => ({}));
              const errMsg = errData.errors
                ? errData.errors.map((e) => e.message).join(", ")
                : `SendGrid returned status ${response.status}`;
              throw new Error(errMsg);
            }
          },
        },
        fromEmail: emailConfig.formEmail || "",
        config: emailConfig,
      };
    }

    // SMTP provider (default)
    const { host, port, username, password } = emailConfig;

    if (host && port && username && password) {
      return {
        transporter: nodemailer.createTransport({
          host,
          port: parseInt(port, 10),
          secure: parseInt(port, 10) === 465,
          auth: { user: username, pass: password },
          connectionTimeout: 10000,
        }),
        fromEmail: emailConfig.formEmail || username,
        config: emailConfig,
      };
    }

    if (
      process.env.SMTP_HOST &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS
    ) {
      const fallbackUser = process.env.SMTP_USER;
      return {
        transporter: nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: parseInt(process.env.SMTP_PORT || "587", 10),
          secure: (process.env.SMTP_PORT || "587") === "465",
          auth: { user: fallbackUser, pass: process.env.SMTP_PASS },
          connectionTimeout: 10000,
        }),
        fromEmail: process.env.FORM_EMAIL || fallbackUser,
        config: {
          adminAlerts: { enabled: true, email: fallbackUser },
          autoReplyTemplate: { enabled: true },
        },
      };
    }

    throw new Error(
      `Email is not configured for site: ${siteId}. Configure SMTP or Resend in Email Settings.`,
    );
  }

  async sendPasswordResetEmail(email, token) {
    const siteId = process.env.DEFAULT_SITE_ID || "site_01";
    const site = await prisma.site.findFirst({
      where: {
        OR: [{ id: siteId }, { isActive: true }],
      },
    });

    const siteIdToUse = site ? site.id : siteId;
    const { transporter, fromEmail } =
      await this.getTransporterForSite(siteIdToUse);
    const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/reset-password?token=${token}`;

    await transporter.sendMail({
      from: fromEmail,
      to: email,
      subject: "Password Reset Request",
      text: `A password reset was requested. Use this link (expires in 1 hour): ${resetUrl}`,
      html: `<p>A password reset was requested. Click the link below to reset your password (expires in 1 hour):</p><p><a href="${resetUrl}">${resetUrl}</a></p>`,
    });
  }

  async sendContactFormAlerts(submission, lead, site) {
    const { transporter, fromEmail, config } = await this.getTransporterForSite(
      site.id,
    );
    const { adminAlerts } = config;

    if (adminAlerts?.enabled !== false) {
      const adminEmail =
        config.recipientOverride || adminAlerts?.email || fromEmail;
      
      try {
        // Search database for custom admin notification template
        const template = await prisma.emailTemplate.findFirst({
          where: {
            siteId: site.id,
            name: {
              contains: "admin"
            },
          },
        });

        if (!template) {
          throw new Error("Admin Lead Alert Template not found in the database. Please create one in the Email Templates section.");
        }

        const name = submission.name || "there";
        const email = submission.email || "";
        const phone = submission.phone || "N/A";
        const message = submission.message || "";
        const serviceInterest = lead?.serviceInterest || "General Inquiry";
        const siteName = site.name || "A Health Place";

        const subject = (template.subject || `New Lead / Contact Submission: ${name}`)
          .replaceAll("{name}", name)
          .replaceAll("{email}", email)
          .replaceAll("{phone}", phone)
          .replaceAll("{message}", message)
          .replaceAll("{query}", message)
          .replaceAll("{serviceInterest}", serviceInterest)
          .replaceAll("{siteName}", siteName);

        const html = template.htmlContent
          .replaceAll("{name}", name)
          .replaceAll("{email}", email)
          .replaceAll("{phone}", phone)
          .replaceAll("{message}", message)
          .replaceAll("{query}", message)
          .replaceAll("{serviceInterest}", serviceInterest)
          .replaceAll("{siteName}", siteName);

        await transporter.sendMail({
          from: fromEmail,
          replyTo: email, 
          to: adminEmail,
          subject,
          html,
        });
        console.log(`[EmailService] Admin notification email sent successfully to ${adminEmail}`);
      } catch (err) {
        console.error("Admin notification email failed:", err);
        await this.logEmailFailure(site.id, err.message, {
          context: "admin-alert",
          to: adminEmail,
        });
      }
    }
  }

  async testConnection(siteId) {
    const settings = await prisma.globalSettings.findUnique({
      where: { siteId },
      select: { emailSettings: true },
    });

    const emailConfig = settings?.emailSettings || {};
    const provider = emailConfig.provider || "smtp";

    if (provider === "resend") {
      const apiKey = emailConfig.resendApiKey;
      if (!apiKey) throw new Error("Resend API key is not configured.");
      const resend = new Resend(apiKey);
      const { data, error } = await resend.apiKeys.list();
      if (error) throw new Error(`Resend connection failed: ${error.message}`);
      return { success: true, message: "Resend API key is valid." };
    }

    if (provider === "sendgrid") {
      const apiKey = emailConfig.sendgridApiKey;
      if (!apiKey) throw new Error("SendGrid API key is not configured.");
      const response = await fetch("https://api.sendgrid.com/v3/scopes", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      });
      if (!response.ok) {
        throw new Error(`SendGrid connection failed with status: ${response.status}`);
      }
      return { success: true, message: "SendGrid API key is valid." };
    }

    const { host, port, username, password } = emailConfig;
    if (!host || !port || !username || !password) {
      throw new Error("SMTP is not fully configured.");
    }
    const transporter = nodemailer.createTransport({
      host,
      port: parseInt(port, 10),
      secure: parseInt(port, 10) === 465,
      auth: { user: username, pass: password },
      connectionTimeout: 5000,
      greetingTimeout: 5000,
      socketTimeout: 5000,
    });
    await transporter.verify();
    return { success: true, message: "SMTP connection verified." };
  }

  async sendTestEmail(siteId, recipientEmail) {
    const { transporter, fromEmail } = await this.getTransporterForSite(siteId);
    await transporter.sendMail({
      from: fromEmail,
      to: recipientEmail,
      subject: "Test Email - Global Backend CMS",
      text: "This is a test email to verify your email configuration is working correctly.",
      html: "<p>This is a test email to verify your email configuration is working correctly.</p>",
    });
    return {
      success: true,
      message: `Test email sent successfully to ${recipientEmail}`,
    };
  }

  async logEmailFailure(siteId, errorMessage, context = {}) {
    try {
      const settings = await prisma.globalSettings.findUnique({
        where: { siteId },
        select: { emailSettings: true },
      });

      const emailConfig = settings?.emailSettings || {};
      const failedLogs = emailConfig.failedLogs || [];

      failedLogs.unshift({
        error: errorMessage,
        timestamp: new Date().toISOString(),
        ...context,
      });

      await prisma.globalSettings.update({
        where: { siteId },
        data: {
          emailSettings: {
            ...emailConfig,
            failedLogs: failedLogs.slice(0, 50),
          },
        },
      });
    } catch (e) {
      console.error("Failed to write failed email log to DB:", e);
    }
  }

  async sendNewsletterWelcomeEmail(siteId, email) {
    try {
      const site = await prisma.site.findUnique({ where: { id: siteId } });
      const siteName = site?.name || "A Health Place";

      const template = await prisma.emailTemplate.findFirst({
        where: {
          siteId,
          name: {
            contains: "newsletter"
          },
        },
      });

      if (!template) {
        throw new Error("Newsletter Welcome Template not found in the database. Please create one in the Email Templates section.");
      }

      const subject = (template.subject || "Welcome to the family! 🎉")
        .replaceAll("{email}", email)
        .replaceAll("{siteName}", siteName);

      const html = template.htmlContent
        .replaceAll("{email}", email)
        .replaceAll("{siteName}", siteName);

      const { transporter, fromEmail } = await this.getTransporterForSite(siteId);
      await transporter.sendMail({
        from: fromEmail,
        to: email,
        subject,
        html,
      });
      console.log(`[EmailService] Newsletter welcome email sent successfully to ${email}`);
    } catch (err) {
      console.error("[EmailService] Failed to send newsletter welcome email:", err);
      await this.logEmailFailure(siteId, err.message, { context: "newsletter-welcome", recipient: email });
    }
  }

  async sendLeadWelcomeEmail(siteId, lead) {
    try {
      const site = await prisma.site.findUnique({ where: { id: siteId } });
      const siteName = site?.name || "A Health Place";

      const template = await prisma.emailTemplate.findFirst({
        where: {
          siteId,
          name: {
            contains: "lead"
          },
        },
      });

      if (!template) {
        throw new Error("Lead Welcome Template not found in the database. Please create one in the Email Templates section.");
      }

      const name = lead.name || "there";
      const email = lead.email;
      const phone = lead.phone || "N/A";
      const serviceInterest = lead.serviceInterest || "General Inquiry";

      const subject = (template.subject || "Thanks for reaching out! 👋")
        .replaceAll("{name}", name)
        .replaceAll("{email}", email)
        .replaceAll("{phone}", phone)
        .replaceAll("{serviceInterest}", serviceInterest)
        .replaceAll("{siteName}", siteName);

      const html = template.htmlContent
        .replaceAll("{name}", name)
        .replaceAll("{email}", email)
        .replaceAll("{phone}", phone)
        .replaceAll("{serviceInterest}", serviceInterest)
        .replaceAll("{siteName}", siteName);

      const { transporter, fromEmail } = await this.getTransporterForSite(siteId);
      await transporter.sendMail({
        from: fromEmail,
        to: email,
        subject,
        html,
      });
      console.log(`[EmailService] Lead welcome email sent successfully to ${email}`);
    } catch (err) {
      console.error("[EmailService] Failed to send lead welcome email:", err);
      await this.logEmailFailure(siteId, err.message, { context: "lead-welcome", recipient: lead.email });
    }
  }
}

export const emailService = new EmailService();
