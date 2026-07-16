import prisma from "@/lib/prisma";

export const pushService = {
  async getNotifications(siteId) {
    return prisma.pushNotification.findMany({
      where: { siteId },
      include: {
        emailCampaign: true
      },
      orderBy: { createdAt: "desc" }
    });
  },

  async getNotification(siteId, id) {
    return prisma.pushNotification.findFirst({
      where: { id, siteId },
      include: {
        emailCampaign: true
      }
    });
  },

  async createNotification(siteId, data) {
    const {
      title,
      message,
      url,
      iconUrl,
      imageUrl,
      segment = "Subscribed Users",
      filters,
      scheduledAt,
      isRecurring = false,
      recurringRule,
      emailCampaignId,
      sendToWebsite = true,
      sendToDevice = true
    } = data;

    let status = "draft";
    if (scheduledAt && new Date(scheduledAt) > new Date()) {
      status = "scheduled";
    }

    return prisma.pushNotification.create({
      data: {
        siteId,
        title,
        message,
        url: url || null,
        iconUrl: iconUrl || null,
        imageUrl: imageUrl || null,
        segment,
        filters: filters ? JSON.stringify(filters) : null,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        isRecurring,
        recurringRule: recurringRule ? JSON.stringify(recurringRule) : null,
        sendToWebsite,
        sendToDevice,
        status,
        emailCampaignId: emailCampaignId || null
      },
      include: {
        emailCampaign: true
      }
    });
  },

  async updateNotification(siteId, id, data) {
    const existing = await prisma.pushNotification.findFirst({
      where: { id, siteId }
    });
    if (!existing) throw new Error("Notification not found");
    if (existing.status === "sent") throw new Error("Cannot edit a sent notification");

    const {
      title,
      message,
      url,
      iconUrl,
      imageUrl,
      segment,
      filters,
      scheduledAt,
      isRecurring,
      recurringRule,
      emailCampaignId,
      sendToWebsite,
      sendToDevice
    } = data;

    let status = existing.status;
    if (scheduledAt && new Date(scheduledAt) > new Date()) {
      status = "scheduled";
    } else if (status === "scheduled" && !scheduledAt) {
      status = "draft";
    }

    return prisma.pushNotification.update({
      where: { id },
      data: {
        title: title ?? existing.title,
        message: message ?? existing.message,
        url: url !== undefined ? (url || null) : existing.url,
        iconUrl: iconUrl !== undefined ? (iconUrl || null) : existing.iconUrl,
        imageUrl: imageUrl !== undefined ? (imageUrl || null) : existing.imageUrl,
        segment: segment ?? existing.segment,
        filters: filters !== undefined ? (filters ? JSON.stringify(filters) : null) : existing.filters,
        scheduledAt: scheduledAt !== undefined ? (scheduledAt ? new Date(scheduledAt) : null) : existing.scheduledAt,
        isRecurring: isRecurring !== undefined ? isRecurring : existing.isRecurring,
        recurringRule: recurringRule !== undefined ? (recurringRule ? JSON.stringify(recurringRule) : null) : existing.recurringRule,
        sendToWebsite: sendToWebsite !== undefined ? sendToWebsite : existing.sendToWebsite,
        sendToDevice: sendToDevice !== undefined ? sendToDevice : existing.sendToDevice,
        status,
        emailCampaignId: emailCampaignId !== undefined ? (emailCampaignId || null) : existing.emailCampaignId
      },
      include: {
        emailCampaign: true
      }
    });
  },

  async duplicateNotification(siteId, id) {
    const original = await prisma.pushNotification.findFirst({
      where: { id, siteId }
    });
    if (!original) throw new Error("Notification not found");

    return prisma.pushNotification.create({
      data: {
        siteId,
        title: `${original.title} (Copy)`,
        message: original.message,
        url: original.url,
        iconUrl: original.iconUrl,
        imageUrl: original.imageUrl,
        segment: original.segment,
        filters: original.filters,
        isRecurring: original.isRecurring,
        recurringRule: original.recurringRule,
        sendToWebsite: original.sendToWebsite,
        sendToDevice: original.sendToDevice,
        status: "draft",
        emailCampaignId: original.emailCampaignId
      },
      include: {
        emailCampaign: true
      }
    });
  },

  async deleteNotification(siteId, id) {
    return prisma.pushNotification.delete({
      where: { id, siteId }
    });
  },

  async getNotificationStats(siteId, notificationId) {
    const notification = await prisma.pushNotification.findFirst({
      where: { id: notificationId, siteId }
    });
    if (!notification) throw new Error("Notification not found");
    if (!notification.oneSignalId) {
      return {
        sentCount: notification.sentCount,
        deliveredCount: notification.deliveredCount,
        clickedCount: notification.clickedCount,
        failedCount: notification.failedCount
      };
    }

    const settings = await prisma.globalSettings.findUnique({
      where: { siteId },
      select: { emailSettings: true }
    });
    const emailSettings = settings?.emailSettings || {};
    if (!emailSettings.oneSignalAppId || !emailSettings.oneSignalRestKey) {
      return {
        sentCount: notification.sentCount,
        deliveredCount: notification.deliveredCount,
        clickedCount: notification.clickedCount,
        failedCount: notification.failedCount
      };
    }

    try {
      const response = await fetch(
        `https://onesignal.com/api/v1/notifications/${notification.oneSignalId}?app_id=${emailSettings.oneSignalAppId}`,
        {
          headers: {
            "Authorization": `Basic ${emailSettings.oneSignalRestKey}`
          }
        }
      );
      const data = await response.json();
      if (response.ok && data.id) {
        const sentCount = data.successful || notification.sentCount;
        const clickedCount = data.converted || 0;
        const failedCount = data.failed || 0;
        const deliveredCount = sentCount - failedCount;

        await prisma.pushNotification.update({
          where: { id: notificationId },
          data: { sentCount, deliveredCount, clickedCount, failedCount }
        });

        return { sentCount, deliveredCount, clickedCount, failedCount };
      }
    } catch (e) {
      console.error("Failed to fetch OneSignal stats:", e);
    }

    return {
      sentCount: notification.sentCount,
      deliveredCount: notification.deliveredCount,
      clickedCount: notification.clickedCount,
      failedCount: notification.failedCount
    };
  },

  async getAnalytics(siteId) {
    const notifications = await prisma.pushNotification.findMany({
      where: { siteId },
      select: {
        id: true,
        title: true,
        status: true,
        sentCount: true,
        deliveredCount: true,
        clickedCount: true,
        failedCount: true,
        sentAt: true,
        createdAt: true
      },
      orderBy: { createdAt: "desc" },
      take: 50
    });

    const totals = notifications.reduce(
      (acc, n) => {
        acc.totalSent += n.sentCount;
        acc.totalDelivered += n.deliveredCount;
        acc.totalClicked += n.clickedCount;
        acc.totalFailed += n.failedCount;
        return acc;
      },
      { totalSent: 0, totalDelivered: 0, totalClicked: 0, totalFailed: 0 }
    );

    const ctr = totals.totalSent > 0
      ? ((totals.totalClicked / totals.totalSent) * 100).toFixed(1)
      : "0.0";

    const sentNotifications = notifications.filter(n => n.status === "sent");
    const topCampaigns = [...sentNotifications]
      .sort((a, b) => b.clickedCount - a.clickedCount)
      .slice(0, 5);

    return {
      totals: { ...totals, ctr },
      topCampaigns,
      recent: notifications.slice(0, 10)
    };
  },

  async sendPushNotification(siteId, notificationId) {
    const notification = await prisma.pushNotification.findFirst({
      where: { id: notificationId, siteId }
    });
    if (!notification) throw new Error("Notification not found");

    // If sendToDevice is disabled, bypass OneSignal
    if (!notification.sendToDevice) {
      const isFuture = notification.scheduledAt && new Date(notification.scheduledAt) > new Date();
      await prisma.pushNotification.update({
        where: { id: notificationId },
        data: {
          status: isFuture ? "scheduled" : "sent",
          sentAt: isFuture ? null : new Date()
        }
      });
      return {
        success: true,
        message: isFuture ? "Scheduled for website notifications" : "Published to website notifications",
        recipients: 0
      };
    }

    const settings = await prisma.globalSettings.findUnique({
      where: { siteId },
      select: { emailSettings: true }
    });

    const emailSettings = settings?.emailSettings || {};
    if (!emailSettings.oneSignalAppId || !emailSettings.oneSignalRestKey) {
      console.warn("OneSignal credentials are not configured on this site. Skipping OneSignal and marking as sent/scheduled locally.");
      
      const isFuture = notification.scheduledAt && new Date(notification.scheduledAt) > new Date();
      await prisma.pushNotification.update({
        where: { id: notificationId },
        data: {
          status: isFuture ? "scheduled" : "sent",
          sentAt: isFuture ? null : new Date()
        }
      });
      return {
        success: true,
        warning: "Announcements posted to website, but device push was skipped (OneSignal credentials missing)",
        recipients: 0
      };
    }

    // Update status to sending
    await prisma.pushNotification.update({
      where: { id: notificationId },
      data: { status: "sending" }
    });

    // Build OneSignal payload
    const payload = {
      app_id: emailSettings.oneSignalAppId,
      headings: { en: notification.title },
      contents: { en: notification.message }
    };

    if (notification.url) {
      payload.url = notification.url;
    }
    if (notification.iconUrl) {
      payload.small_icon = notification.iconUrl;
      payload.large_icon = notification.iconUrl;
    }
    if (notification.imageUrl) {
      payload.big_picture = notification.imageUrl;
      payload.chrome_web_image = notification.imageUrl;
    }

    // Audience targeting
    if (notification.filters) {
      try {
        const parsedFilters = JSON.parse(notification.filters);
        if (Array.isArray(parsedFilters) && parsedFilters.length > 0) {
          payload.filters = parsedFilters;
        } else {
          payload.included_segments = [notification.segment || "Subscribed Users"];
        }
      } catch {
        payload.included_segments = [notification.segment || "Subscribed Users"];
      }
    } else {
      payload.included_segments = [notification.segment || "Subscribed Users"];
    }

    // Scheduling
    if (notification.scheduledAt && new Date(notification.scheduledAt) > new Date()) {
      payload.send_after = notification.scheduledAt.toISOString();
    }

    const response = await fetch("https://onesignal.com/api/v1/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Basic ${emailSettings.oneSignalRestKey}`
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (response.ok && !data.errors) {
      await prisma.pushNotification.update({
        where: { id: notificationId },
        data: {
          status: notification.scheduledAt && new Date(notification.scheduledAt) > new Date()
            ? "scheduled"
            : "sent",
          oneSignalId: data.id,
          sentCount: data.recipients || 0,
          sentAt: new Date()
        }
      });
      return { success: true, recipients: data.recipients || 0, oneSignalId: data.id };
    } else {
      const errorMsg = data.errors ? data.errors.join(", ") : "OneSignal request failed";
      await prisma.pushNotification.update({
        where: { id: notificationId },
        data: { status: "failed" }
      });
      throw new Error(errorMsg);
    }
  }
};
