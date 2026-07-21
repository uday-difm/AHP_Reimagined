import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/requireAuth";
import { getSiteForUser } from "@/lib/getSiteForUser";
import { uploadToS3 } from "@/../utils/s3Utility";
import cloudinary from "@/lib/cloudinary";
import { Readable } from "stream";

// Helper to upload to Cloudinary as fallback
async function uploadToCloudinary(buffer, fileName, folder = "magazines") {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "auto",
        quality: "auto",
        fetch_format: "auto",
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result.secure_url);
      }
    );
    Readable.from(buffer).pipe(uploadStream);
  });
}

// Helper to upload files to either S3 or Cloudinary
async function handleImageUpload(file, folder = "magazines") {
  if (typeof file === "string" && (file.startsWith("http") || file.startsWith("/"))) {
    return file;
  }
  if (!file || typeof file !== "object" || !("arrayBuffer" in file)) {
    return "";
  }
  const buffer = Buffer.from(await file.arrayBuffer());
  let imageUrl = "";

  const accessKey = process.env.S3_ACCESS_KEY || process.env.ACCESSKEY;
  const secretKey = process.env.S3_SECRET_KEY || process.env.SECRETKEY;
  const bucket = process.env.S3_BUCKET || process.env.BUCKET;

  if (accessKey && secretKey && bucket) {
    try {
      imageUrl = await uploadToS3(folder, {
        originalname: file.name,
        buffer,
        mimetype: file.type,
      });
    } catch (s3Error) {
      console.error("S3 upload failed, trying Cloudinary...", s3Error);
    }
  }

  if (!imageUrl) {
    try {
      imageUrl = await uploadToCloudinary(buffer, file.name, folder);
    } catch (cloudinaryError) {
      console.error("Cloudinary upload failed:", cloudinaryError);
      throw new Error(`Failed to upload file ${file.name}`);
    }
  }
  return imageUrl;
}

// Helper to register uploaded images in the global Media model
async function registerUploadedImageInMedia(siteId, imageUrl, fileName) {
  if (!imageUrl) return;
  const fileExtension = fileName ? (fileName.split(".").pop() || "png") : "png";
  let publicId = imageUrl;
  
  if (imageUrl.includes("key=")) {
    publicId = imageUrl.split("key=")[1];
  } else if (imageUrl.includes("cloudinary.com")) {
    const parts = imageUrl.split("/");
    publicId = parts.slice(parts.indexOf("upload") + 2).join("/");
    publicId = publicId.split(".")[0];
  }

  try {
    await prisma.media.create({
      data: {
        siteId,
        fileName: fileName || "magazine_image",
        originalName: fileName || "magazine_image",
        publicId: publicId,
        url: imageUrl,
        secureUrl: imageUrl,
        mimeType: "image/png", // generic fallback
        extension: fileExtension,
        isImage: true,
      }
    });
  } catch (err) {
    console.error("Failed to register image in Media system:", err);
  }
}

export async function GET(request, context) {
  try {
    const user = await requireAuth();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { slug } = await context.params;
    const magazine = await prisma.magazine.findUnique({
      where: { slug },
    });

    if (!magazine) {
      return NextResponse.json({ error: "Magazine not found" }, { status: 404 });
    }

    return NextResponse.json(magazine);
  } catch (error) {
    console.error("Error fetching magazine:", error);
    return NextResponse.json({ error: "Failed to fetch magazine." }, { status: 500 });
  }
}

export async function PUT(request, context) {
  try {
    const user = await requireAuth();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { slug } = await context.params;
    const existing = await prisma.magazine.findUnique({
      where: { slug },
    });

    if (!existing) {
      return NextResponse.json({ error: "Magazine not found" }, { status: 404 });
    }

    const formData = await request.formData();
    const magazine_id = formData.get("magazine_id");
    const magazine_title = formData.get("magazine_title");
    const magazine_description = formData.get("magazine_description");
    const magazine_introduction = formData.get("magazine_introduction");
    const magazine_tags = formData.get("magazine_tags");
    const magazine_cover_image = formData.get("magazine_cover_image");
    const magazine_back_image = formData.get("magazine_back_image");
    const magazine_spine_image = formData.get("magazine_spine_image");
    const magazine_link = formData.get("magazine_link");
    const magazine_date = formData.get("magazine_date");
    const magazine_category = formData.get("magazine_category");
    const MagCloudLink = formData.get("MagCloudLink");
    const magazine_slug = formData.get("magazine_slug");
    const status = parseInt(formData.get("status") || "1");

    let publisherSocials = existing.publisherSocials;
    try {
      const socialsRaw = formData.get("publisherSocials");
      if (socialsRaw) {
        publisherSocials = JSON.parse(socialsRaw);
      }
    } catch (e) {
      console.error("Failed to parse publisherSocials:", e);
    }

    if (!magazine_title || !magazine_slug || !magazine_date) {
      return NextResponse.json({ error: "Title, slug, and date are required." }, { status: 400 });
    }

    // Check slug uniqueness if it changed
    if (magazine_slug !== slug) {
      const exists = await prisma.magazine.findUnique({
        where: { slug: magazine_slug },
      });
      if (exists) {
        return NextResponse.json({ error: "Slug already exists. Please choose a different title." }, { status: 400 });
      }
    }

    // Resolve siteId
    const site = await getSiteForUser(user);
    const siteId = site?.id || "infinium";

    // Handle uploads — retain existing if no new file provided
    let imageUrl = existing.coverImage;
    if (magazine_cover_image) {
      const coverUrl = await handleImageUpload(magazine_cover_image);
      if (coverUrl) {
        imageUrl = coverUrl;
        if (typeof magazine_cover_image !== "string") {
          await registerUploadedImageInMedia(siteId, imageUrl, magazine_cover_image.name);
        }
      }
    }

    let backImageUrl = existing.backImage;
    if (magazine_back_image) {
      const backUrl = await handleImageUpload(magazine_back_image);
      if (backUrl) {
        backImageUrl = backUrl;
        if (typeof magazine_back_image !== "string") {
          await registerUploadedImageInMedia(siteId, backImageUrl, magazine_back_image.name);
        }
      }
    }

    let spineImageUrl = existing.spineImage;
    if (magazine_spine_image) {
      const spineUrl = await handleImageUpload(magazine_spine_image);
      if (spineUrl) {
        spineImageUrl = spineUrl;
        if (typeof magazine_spine_image !== "string") {
          await registerUploadedImageInMedia(siteId, spineImageUrl, magazine_spine_image.name);
        }
      }
    }

    // Update in Prisma
    const updated = await prisma.magazine.update({
      where: { slug },
      data: {
        magazineId: magazine_id || "",
        title: magazine_title,
        description: magazine_description || "",
        introduction: magazine_introduction || "",
        backImage: backImageUrl || "",
        spineImage: spineImageUrl || "",
        tags: magazine_tags || "",
        coverImage: imageUrl,
        link: magazine_link || "",
        date: new Date(magazine_date),
        category: magazine_category || "",
        magCloudLink: MagCloudLink || "",
        slug: magazine_slug,
        status,
        publisherSocials,
      },
    });

    return NextResponse.json({ success: true, magazine: updated });
  } catch (error) {
    console.error("Error updating magazine:", error);
    return NextResponse.json({ error: "Failed to update magazine." }, { status: 500 });
  }
}

export async function DELETE(request, context) {
  try {
    const user = await requireAuth();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { slug } = await context.params;
    const existing = await prisma.magazine.findUnique({
      where: { slug },
    });

    if (!existing) {
      return NextResponse.json({ error: "Magazine not found" }, { status: 404 });
    }

    await prisma.magazine.delete({
      where: { slug },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting magazine:", error);
    return NextResponse.json({ error: "Failed to delete magazine." }, { status: 500 });
  }
}
