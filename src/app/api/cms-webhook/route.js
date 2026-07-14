import { revalidatePath } from "next/cache";
import crypto from "crypto";

export async function POST(req) {
  try {
    const body = await req.text();
    const sig = req.headers.get("x-cms-signature");

    const secret = process.env.CMS_WEBHOOK_SECRET;
    if (!secret) {
      console.error("[Webhook] CMS_WEBHOOK_SECRET env variable is not set");
      return Response.json({ error: "Webhook secret not configured" }, { status: 500 });
    }

    // Verify cryptographic signature to ensure request came from our CMS
    const expected = "sha256=" + crypto
      .createHmac("sha256", secret)
      .update(body)
      .digest("hex");

    if (sig !== expected) {
      console.warn("[Webhook] Signature verification failed");
      return Response.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event = JSON.parse(body);
    console.log(`[Webhook] Received event: ${event.event}`, event.data);

    // Revalidate paths based on the content type that changed
    if (event.event.startsWith("post.")) {
      const post = event.data;
      if (post && post.slug) {
        revalidatePath(`/blogs/${post.slug}`);
      }
      revalidatePath("/blogs");
      revalidatePath("/");
    } else if (event.event.startsWith("page.")) {
      const page = event.data;
      if (page && page.slug) {
        revalidatePath(`/${page.slug}`);
      }
      revalidatePath("/");
    } else if (event.event.startsWith("service.")) {
      revalidatePath("/services");
      revalidatePath("/");
    } else if (event.event === "global_settings.updated") {
      revalidatePath("/", "layout");
    }

    return Response.json({ ok: true });
  } catch (err) {
    console.error("[Webhook] Error handling webhook event:", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
