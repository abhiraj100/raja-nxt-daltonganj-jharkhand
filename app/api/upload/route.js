import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";

export async function POST(request) {
  const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const API_KEY    = process.env.CLOUDINARY_API_KEY;
  const API_SECRET = process.env.CLOUDINARY_API_SECRET;

  if (!CLOUD_NAME || CLOUD_NAME === "your_cloud_name_here")
    return NextResponse.json({ error: ".env.local mein NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME set nahi hai" }, { status: 500 });

  if (!API_KEY || API_KEY === "your_api_key_here")
    return NextResponse.json({ error: ".env.local mein CLOUDINARY_API_KEY set nahi hai" }, { status: 500 });

  if (!API_SECRET || API_SECRET === "your_api_secret_here")
    return NextResponse.json({ error: "CLOUDINARY_API_SECRET set nahi hai — cloudinary.com/console → API Keys → Reveal" }, { status: 500 });

  cloudinary.config({ cloud_name: CLOUD_NAME, api_key: API_KEY, api_secret: API_SECRET, secure: true });

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file) return NextResponse.json({ error: "Koi file nahi mili" }, { status: 400 });

    const allowed = ["image/jpeg","image/jpg","image/png","image/webp","image/gif"];
    if (!allowed.includes(file.type))
      return NextResponse.json({ error: "Sirf JPG, PNG, WEBP, GIF allowed hai" }, { status: 400 });

    if (file.size > 5 * 1024 * 1024)
      return NextResponse.json({ error: `File bahut badi. Max 5MB. Aapki: ${(file.size/1024/1024).toFixed(1)}MB` }, { status: 400 });

    const bytes  = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = `data:${file.type};base64,${buffer.toString("base64")}`;

    const result = await cloudinary.uploader.upload(base64, {
      folder: "raja-nxt-products",
      resource_type: "image",
      transformation: [{ width: 800, height: 1000, crop: "limit", quality: "auto:good", fetch_format: "auto" }],
    });

    return NextResponse.json({ url: result.secure_url, publicId: result.public_id });

  } catch (err) {
    console.error("Cloudinary error:", err);
    let msg = err?.message || "Upload failed";
    if (msg.includes("api_key"))    msg = "API Key galat hai — CLOUDINARY_API_KEY check karo";
    if (msg.includes("api_secret")) msg = "API Secret galat hai — CLOUDINARY_API_SECRET check karo";
    if (msg.includes("cloud_name")) msg = "Cloud Name galat hai — NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME check karo";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}


// import { v2 as cloudinary } from "cloudinary";
// import { NextResponse } from "next/server";

// // Server-side config — API Secret is NEVER sent to browser
// cloudinary.config({
//   cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
//   api_key:    process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
//   secure: true,
// });

// export async function POST(request) {
//   try {
//     const formData = await request.formData();
//     const file = formData.get("file");

//     if (!file) {
//       return NextResponse.json({ error: "No file provided" }, { status: 400 });
//     }

//     // Validate type
//     const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
//     if (!allowedTypes.includes(file.type)) {
//       return NextResponse.json({ error: "Only JPG, PNG, WEBP, GIF allowed" }, { status: 400 });
//     }

//     // Validate size (5 MB)
//     if (file.size > 5 * 1024 * 1024) {
//       return NextResponse.json({
//         error: `File too large. Max 5MB. Your file: ${(file.size / 1024 / 1024).toFixed(1)}MB`,
//       }, { status: 400 });
//     }

//     // Convert file to base64 buffer
//     const bytes  = await file.arrayBuffer();
//     const buffer = Buffer.from(bytes);
//     const base64 = `data:${file.type};base64,${buffer.toString("base64")}`;

//     // Upload to Cloudinary (signed, server-side — no 401 errors)
//     const result = await cloudinary.uploader.upload(base64, {
//       folder: "raja-nxt-products",
//       resource_type: "image",
//       transformation: [
//         { width: 800, height: 1000, crop: "limit", quality: "auto:good", fetch_format: "auto" },
//       ],
//     });

//     return NextResponse.json({
//       url: result.secure_url,
//       publicId: result.public_id,
//       width: result.width,
//       height: result.height,
//     });
//   } catch (err) {
//     console.error("Cloudinary upload error:", err);
//     return NextResponse.json(
//       { error: err?.message || "Upload failed. Check your Cloudinary credentials in .env.local" },
//       { status: 500 }
//     );
//   }
// }
