import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import WellnessShowcase from "./WellnessShowcase";
import AdSlot from "./AdSlot";

export default async function HomepageAuthenticatedSections() {
  // We can fetch the session here if needed for other props, 
  // but WellnessShowcase handles its own authentication state.

  return (
    <div className="w-full">
      <WellnessShowcase />
      <AdSlot zone="homepage-about-bottom" />
    </div>
  );
}
