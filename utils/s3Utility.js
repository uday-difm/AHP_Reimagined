import { S3Client, PutObjectCommand, DeleteObjectCommand, HeadBucketCommand, CreateBucketCommand, PutBucketPolicyCommand, GetObjectCommand } from "@aws-sdk/client-s3";

/**
 * Uploads a file to an S3-compatible bucket.
 * @param {string} folder - The destination folder in the bucket
 * @param {Object} file - File object containing originalname, buffer, and mimetype
 * @param {string} [customKey] - Optional custom key/path for the file in the bucket
 * @returns {Promise<string>} The uploaded file URL
 */
let s3ClientInstance = null;

/**
 * Lazily initializes and returns the S3Client instance.
 * @returns {S3Client}
 */
export function getS3Client() {
  if (s3ClientInstance) return s3ClientInstance;

  const accessKeyId = process.env.S3_ACCESS_KEY || process.env.ACCESSKEY || process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.S3_SECRET_KEY || process.env.SECRETKEY || process.env.AWS_SECRET_ACCESS_KEY;
  const region = process.env.S3_REGION || process.env.REGION || process.env.AWS_REGION || "us-east-1";
  const endpoint = process.env.S3_ENDPOINT || process.env.ENDPOINT || process.env.AWS_ENDPOINT;

  if (!accessKeyId || !secretAccessKey) {
    throw new Error("S3 credentials not fully configured in environment variables");
  }

  const s3Config = {
    region,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  };

  if (endpoint) {
    s3Config.endpoint = endpoint;
    s3Config.forcePathStyle = true; // Required for many S3-compatible providers
  }

  s3ClientInstance = new S3Client(s3Config);
  return s3ClientInstance;
}

/**
 * Uploads a file to an S3-compatible bucket.
 * @param {string} folder - The destination folder in the bucket
 * @param {Object} file - File object containing originalname, buffer, and mimetype
 * @param {string} [customKey] - Optional custom key/path for the file in the bucket
 * @returns {Promise<string>} The uploaded file URL
 */
export async function uploadToS3(folder, file, customKey = null) {
  const bucket = process.env.S3_BUCKET || process.env.BUCKET || process.env.AWS_BUCKET_NAME;
  const region = process.env.S3_REGION || process.env.REGION || process.env.AWS_REGION || "us-east-1";
  const endpoint = process.env.S3_ENDPOINT || process.env.ENDPOINT || process.env.AWS_ENDPOINT;

  if (!bucket) {
    throw new Error("S3 bucket not configured in environment variables");
  }

  const s3Client = getS3Client();

  // Auto-verify and create bucket if it doesn't exist
  try {
    await s3Client.send(new HeadBucketCommand({ Bucket: bucket }));
  } catch (err) {
    if (err.name === "NotFound" || err.$metadata?.httpStatusCode === 404) {
      try {
        await s3Client.send(new CreateBucketCommand({ Bucket: bucket }));
        // Apply public read policy to allow browser clients to read uploaded assets
        const policy = {
          Version: "2012-10-17",
          Statement: [
            {
              Sid: "PublicReadGetObject",
              Effect: "Allow",
              Principal: "*",
              Action: ["s3:GetObject"],
              Resource: [`arn:aws:s3:::${bucket}/*`],
            },
          ],
        };
        await s3Client.send(
          new PutBucketPolicyCommand({
            Bucket: bucket,
            Policy: JSON.stringify(policy),
          })
        );
      } catch (createErr) {
        if (createErr.name !== "BucketAlreadyExists" && createErr.name !== "BucketAlreadyOwnedByYou") {
          throw createErr;
        }
      }
    } else {
      throw err;
    }
  }

  const fileExtension = file.originalname.split(".").pop();

  const uniqueFileName = customKey || `${folder}/${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExtension}`;

  await s3Client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: uniqueFileName,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: "public-read",
    })
  );

  if (endpoint) {
    const protocol = endpoint.startsWith("https") ? "https" : "http";
    const cleanedEndpoint = endpoint.replace(/^https?:\/\//, "");
    return `${protocol}://${cleanedEndpoint}/${bucket}/${uniqueFileName}`;
  }
  return `https://${bucket}.s3.${region}.amazonaws.com/${uniqueFileName}`;
}

/**
 * Deletes an object from an S3-compatible bucket.
 * @param {string} key - The key/path of the object to delete
 * @returns {Promise<void>}
 */
export async function deleteFromS3(key) {
  const bucket = process.env.S3_BUCKET || process.env.BUCKET || process.env.AWS_BUCKET_NAME;

  if (!bucket) {
    throw new Error("S3 bucket not configured in environment variables");
  }

  const s3Client = getS3Client();

  await s3Client.send(
    new DeleteObjectCommand({
      Bucket: bucket,
      Key: key,
    })
  );
}

/**
 * Gets an object from an S3-compatible bucket as a Buffer along with metadata.
 * @param {string} key - The key/path of the object to retrieve
 * @returns {Promise<{body: Buffer, contentType: string, contentLength: number}>} The object data and metadata
 */
export async function getObjectFromS3(key) {
  const bucket = process.env.S3_BUCKET || process.env.BUCKET || process.env.AWS_BUCKET_NAME;

  if (!bucket) {
    throw new Error("S3 bucket not configured in environment variables");
  }

  const s3Client = getS3Client();

  let response;
  try {
    response = await s3Client.send(
      new GetObjectCommand({
        Bucket: bucket,
        Key: key,
      })
    );
  } catch (err) {
    const endpoint = process.env.S3_ENDPOINT || process.env.ENDPOINT;
    if (endpoint) {
      console.warn(`[S3 Proxy] Signed fetch failed for key "${key}", trying anonymous HTTP fallback... Reason: ${err.message}`);
      const protocol = endpoint.startsWith("https") ? "https" : "http";
      const cleanedEndpoint = endpoint.replace(/^https?:\/\//, "");
      const url = `${protocol}://${cleanedEndpoint}/${bucket}/${key}`;

      try {
        const fetchRes = await fetch(url);
        if (!fetchRes.ok) {
          throw new Error(`Anonymous fetch failed with status ${fetchRes.status}`);
        }
        const arrayBuffer = await fetchRes.arrayBuffer();
        return {
          body: Buffer.from(arrayBuffer),
          contentType: fetchRes.headers.get("content-type") || "application/octet-stream",
          contentLength: parseInt(fetchRes.headers.get("content-length") || "0", 10) || arrayBuffer.byteLength,
        };
      } catch (fallbackErr) {
        console.error(`[S3 Proxy] Anonymous fallback also failed for key "${key}":`, fallbackErr.message);
        throw err; // throw original S3 signature error if fallback also fails
      }
    }
    throw err;
  }

  const streamToBuffer = (stream) =>
    new Promise((resolve, reject) => {
      const chunks = [];
      stream.on("data", (chunk) => chunks.push(chunk));
      stream.on("error", reject);
      stream.on("end", () => resolve(Buffer.concat(chunks)));
    });

  const buffer = await streamToBuffer(response.Body);

  return {
    body: buffer,
    contentType: response.ContentType,
    contentLength: response.ContentLength,
  };
}



