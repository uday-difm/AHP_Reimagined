import { getServerSession } from "next-auth";
import { frontendAuthOptions } from "./frontendAuth";
import prisma from "./prisma";

/**
 * requireFrontendAuth
 * Reads the frontend user session (stored in the "frontend-session-token" cookie)
 * and returns the full User record (with globalRole VISITOR) for the logged-in user.
 *
 * Returns null if no valid session exists.
 */
export async function requireFrontendAuth() {
  try {
    const session = await getServerSession(frontendAuthOptions);
    if (!session?.user?.id) return null;

    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id,
        globalRole: "VISITOR",
        isActive: true,
      },
    });

    return user || null;
  } catch (err) {
    console.error("[requireFrontendAuth] Error:", err);
    return null;
  }
}
