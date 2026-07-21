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

  if ((process.env.S3_ACCESS_KEY || process.env.ACCESSKEY) && (process.env.S3_SECRET_KEY || process.env.SECRETKEY) && (process.env.S3_BUCKET || process.env.BUCKET)) {
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

export async function GET(request) {
  try {
    const user = await requireAuth();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";

    const magazines = await prisma.magazine.findMany({
      where: search ? {
        OR: [
          { title: { contains: search } },
          { description: { contains: search } },
          { tags: { contains: search } },
          { category: { contains: search } }
        ]
      } : {},
      orderBy: { date: "desc" },
    });

    return NextResponse.json({ success: true, magazines });
  } catch (error) {
    console.error("Error fetching magazines:", error);
    return NextResponse.json({ error: "Failed to fetch magazines." }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const user = await requireAuth();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const magazine_id = formData.get("magazine_id");
    const magazine_title = formData.get("magazine_title");
    const magazine_description = formData.get("magazine_description");
    const magazine_introduction = formData.get("magazine_introduction");
    const magazine_tags = formData.get("magazine_tags");
    const magazine_cover_image = formData.get("magazine_cover_image"); // File
    const magazine_back_image = formData.get("magazine_back_image"); // File
    const magazine_spine_image = formData.get("magazine_spine_image"); // File
    const magazine_link = formData.get("magazine_link");
    const magazine_date = formData.get("magazine_date");
    const magazine_category = formData.get("magazine_category");
    const MagCloudLink = formData.get("MagCloudLink");
    const magazine_slug = formData.get("magazine_slug");
    const status = parseInt(formData.get("status") || "1");

    if (!magazine_title || !magazine_slug || !magazine_date) {
      return NextResponse.json({ error: "Title, slug, and date are required." }, { status: 400 });
    }

    // Check slug uniqueness
    const existing = await prisma.magazine.findUnique({
      where: { slug: magazine_slug },
    });
    if (existing) {
      return NextResponse.json({ error: "Slug already exists. Please choose a different title." }, { status: 400 });
    }

    // Resolve siteId
    const site = await getSiteForUser(user);
    const siteId = site?.id || "infinium";

    // Handle cover image upload
    let imageUrl = "";
    if (magazine_cover_image) {
      const coverUrl = await handleImageUpload(magazine_cover_image, "magazines");
      if (coverUrl) {
        imageUrl = coverUrl;
        if (typeof magazine_cover_image !== "string") {
          await registerUploadedImageInMedia(siteId, imageUrl, magazine_cover_image.name);
        }
      }
    }

    // Handle back image upload
    let backImageUrl = "";
    if (magazine_back_image) {
      const backUrl = await handleImageUpload(magazine_back_image, "magazines");
      if (backUrl) {
        backImageUrl = backUrl;
        if (typeof magazine_back_image !== "string") {
          await registerUploadedImageInMedia(siteId, backImageUrl, magazine_back_image.name);
        }
      }
    }

    // Handle spine image upload
    let spineImageUrl = "";
    if (magazine_spine_image) {
      const spineUrl = await handleImageUpload(magazine_spine_image, "magazines");
      if (spineUrl) {
        spineImageUrl = spineUrl;
        if (typeof magazine_spine_image !== "string") {
          await registerUploadedImageInMedia(siteId, spineImageUrl, magazine_spine_image.name);
        }
      }
    }

    const magazine = await prisma.magazine.create({
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
      },
    });

    if (magazine.status === 1) {
      const { queueUpsertContent } = await import("@/lib/queues/searchQueue");
      await queueUpsertContent("magazine", magazine.id.toString());
    }

    return NextResponse.json({ success: true, magazine });
  } catch (error) {
    console.error("Error creating magazine:", error);
    return NextResponse.json({ error: "Failed to create magazine." }, { status: 500 });
  }
}
