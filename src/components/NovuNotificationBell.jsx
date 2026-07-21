"use client";

/**
 * NovuNotificationBell.jsx
 *
 * In-app notification bell using @novu/react's <Inbox> component.
 * Shows a bell icon with unread count + a popover of the user's notifications.
 *
 * Prerequisites:
 *   1. npm install @novu/react
 *   2. Set NEXT_PUBLIC_NOVU_APP_ID in .env (your Novu Application Identifier)
 *   3. The logged-in user must be a synced Novu subscriber
 *      (call POST /api/novu/sync-subscriber on first login or use the
 *       auto-sync in the dashboard layout)
 *
 * Usage in your dashboard layout:
 *   import NovuNotificationBell from "@/components/NovuNotificationBell";
 *   <NovuNotificationBell userId={session.user.id} siteId="AHP" />
 *
 * Props:
 *   userId  {string} - The User.id from NextAuth session
 *   siteId  {string} - Your site's ID (e.g., "AHP")
 *
 * The subscriberId is constructed as "<siteId>_<userId>" to match the
 * convention in lib/novu-subscriber-sync.js.
 */

import { useEffect, useState } from "react";

// Dynamic import to avoid SSR issues with the Novu React SDK
let NovuInbox = null;

export default function NovuNotificationBell({ userId, siteId = "AHP" }) {
  const [InboxComponent, setInboxComponent] = useState(null);
  const [loadError, setLoadError] = useState(false);

  const appId = process.env.NEXT_PUBLIC_NOVU_APP_ID;
  const subscriberId = userId ? `${siteId}_${userId}` : null;

  useEffect(() => {
    // Only load if we have both required values
    if (!appId || !subscriberId) return;

    import("@novu/react")
      .then((mod) => {
        setInboxComponent(() => mod.Inbox);
      })
      .catch((err) => {
        console.error("[NovuNotificationBell] Failed to load @novu/react:", err);
        setLoadError(true);
      });
  }, [appId, subscriberId]);

  // Silent failure — don't render anything if Novu is not configured
  if (!appId || !subscriberId || loadError) {
    return null;
  }

  // Still loading
  if (!InboxComponent) {
    return (
      <button
        aria-label="Notifications loading"
        style={{
          background: "none",
          border: "none",
          cursor: "wait",
          padding: "4px",
          opacity: 0.5,
        }}
      >
        <BellIcon />
      </button>
    );
  }

  return (
    <InboxComponent
      applicationIdentifier={appId}
      subscriberId={subscriberId}
      appearance={{
        variables: {
          colorPrimary: "#0f7c85",
          colorPrimaryForeground: "white",
          colorBackground: "#ffffff",
          colorForeground: "#1a1a2e",
          colorNeutral: "#6b7280",
          fontSize: "14px",
          borderRadius: "8px",
        },
        elements: {
          bellButton: {
            color: "inherit",
          },
        },
      }}
    />
  );
}

/**
 * Simple bell SVG icon (fallback while loading)
 */
function BellIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}
