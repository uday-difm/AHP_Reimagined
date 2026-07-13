import { NextResponse } from "next/server";
import { getObjectFromS3 } from "@/../utils/s3Utility";

/**
 * GET /api/media/proxy?url=<encoded-url>
 *
 * For MinIO/S3 URLs: extracts the S3 object key and fetches via the
 * authenticated S3 SDK (bypasses bucket access restrictions).
 *
 * For Cloudinary and other external URLs: plain server-side fetch
 * (same-origin re-serve, no browser CORS issues).
 */
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "Missing url parameter" }, { status: 400 });
  }

  // Detect if this is a MinIO / S3 endpoint URL and extract the key
  const s3Endpoint = process.env.S3_ENDPOINT || process.env.ENDPOINT;
  const bucket = process.env.S3_BUCKET || process.env.BUCKET || process.env.AWS_BUCKET_NAME;

  const isS3Url =
    s3Endpoint && bucket &&
    (url.includes(s3Endpoint.replace(/^https?:\/\//, "")) ||
      url.startsWith("http://localhost:9000") ||
      url.startsWith("http://127.0.0.1:9000"));

  if (isS3Url) {
    try {
      // Extract the S3 object key: strip protocol + host + bucket prefix
      // URL pattern: http://localhost:9000/<bucket>/<key>
      const urlObj = new URL(url);
      // pathname looks like: /media/magazines/filename.jpg or /bucket/path/filename.jpg
      let pathname = urlObj.pathname;

      // Remove leading bucket name if present
      const bucketPrefix = `/${bucket}/`;
      if (pathname.startsWith(bucketPrefix)) {
        pathname = pathname.slice(bucketPrefix.length);
      } else if (pathname.startsWith("/")) {
        pathname = pathname.slice(1);
      }

      const { body, contentType } = await getObjectFromS3(pathname);

      return new Response(body, {
        headers: {
          "Content-Type": contentType || "image/jpeg",
          "Cache-Control": "public, max-age=86400, stale-while-revalidate=3600",
          "Access-Control-Allow-Origin": "*",
        },
      });
    } catch (err) {
      console.error("S3 proxy fetch failed:", err);
      // Fall through to plain fetch as last resort
    }
  }

  // Plain fetch for Cloudinary or any other public URL
  try {
    const response = await fetch(url);

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch image: ${response.statusText}` },
        { status: response.status }
      );
    }

    const contentType = response.headers.get("content-type") || "image/jpeg";
    const buffer = await response.arrayBuffer();

    return new Response(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=3600",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (err) {
    console.error("Image proxy error:", err);
    return NextResponse.json({ error: "Failed to proxy image" }, { status: 500 });
  }
}
