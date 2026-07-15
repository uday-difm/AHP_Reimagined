"use client";

import { useSession } from "next-auth/react";
import WellnessShowcase from "./WellnessShowcase";
import AdSlot from "./AdSlot";

export default function HomepageAuthenticatedSections() {
  const { status } = useSession();
  const isAuthenticated = status === "authenticated";

  if (!isAuthenticated) return null;

  return (
    <>
      <WellnessShowcase />
      <AdSlot zone="homepage-about-bottom" />
    </>
  );
}
