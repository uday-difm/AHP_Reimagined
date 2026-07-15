import { getObjectFromS3 } from "@/../utils/s3Utility";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get("key");

    if (!key) {
      return new NextResponse("Missing key parameter", { status: 400 });
    }

    const { body, contentType, contentLength } = await getObjectFromS3(key);

    const headers = new Headers();
    headers.set("Content-Type", contentType || "application/octet-stream");
    if (contentLength) {
      headers.set("Content-Length", contentLength.toString());
    }
    // Cache static media assets in CDN and browser for 1 year (31,536,000 seconds)
    headers.set("Cache-Control", "public, max-age=31536000, immutable");

    // Convert the S3 readable stream to a web Response stream
    return new NextResponse(body, {
      headers,
    });
  } catch (err) {
    console.error("Error reading file from S3 proxy:", err);
    return new NextResponse("File not found", { status: 404 });
  }
}
