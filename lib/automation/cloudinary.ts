import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Upload an existing URL to Cloudinary (re-hosting)
export async function uploadToCloudinary(imageUrl: string, publicId: string) {
  try {
    const result = await cloudinary.uploader.upload(imageUrl, {
      public_id: publicId,
      folder: "rajneet/news",
      overwrite: true,
      resource_type: "image",
    });
    return result.secure_url;
  } catch (error) {
    console.error("Cloudinary Upload Error:", error);
    return null; // Fallback to null so we generate one
  }
}

// Generate a custom branded cover image using Cloudinary text overlays
export async function generateBrandedCoverImage(
  headline: string,
  category: string,
  slug: string
): Promise<string> {
  try {
    const cleanHeadline = headline
      .replace(/[^a-zA-Z0-9\s]/g, "")
      .substring(0, 60);

    const categoryColors: Record<string, string> = {
      POLITICAL: "1a3a5c",
      POLITICS: "1a3a5c",
      WORLD: "1a2a3a",
      FINANCE: "0d2b1a",
      HEALTH: "2a0d1a",
      TECHNOLOGY: "1a0d2b",
      TECH: "1a0d2b",
      SPORTS: "2b1a0d",
      ENTERTAINMENT: "2a1a2a",
      LIFESTYLE: "0d1a2b",
      DEFAULT: "0a0f1e",
    };

    const bgColor = categoryColors[category?.toUpperCase()] || categoryColors.DEFAULT;
    const categoryLabel = (category || "NEWS").toUpperCase();

    // Build a Cloudinary transformation URL for a branded cover
    const publicId = `rajneet/news/cover-${slug}`;
    
    const result = await cloudinary.uploader.upload(
      `https://res.cloudinary.com/demo/image/upload/w_1200,h_630,c_fill,q_auto/sample`,
      {
        public_id: publicId,
        folder: "",
        overwrite: true,
        transformation: [
          { width: 1200, height: 630, crop: "fill", background: `#${bgColor}` },
          // Dark overlay
          { overlay: { font_family: "Arial", font_size: 1, text: " " }, color: `#${bgColor}`, width: 1200, height: 630, gravity: "center", x: 0, y: 0 },
        ]
      }
    );

    // Use Cloudinary's URL-based text overlay (more reliable)
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const encodedHeadline = encodeURIComponent(cleanHeadline.substring(0, 50));
    const encodedCategory = encodeURIComponent(categoryLabel);
    const encodedBrand = encodeURIComponent("RAJNEET");
    
    const url = `https://res.cloudinary.com/${cloudName}/image/upload/w_1200,h_630,c_fill,b_rgb:${bgColor}/l_text:Arial_48_bold:${encodedHeadline},co_white,g_center,y_-30,w_1000,c_fit/l_text:Arial_24:${encodedCategory},co_rgb:60a5fa,g_south_west,x_60,y_80/l_text:Arial_28_bold:${encodedBrand},co_rgb:f59e0b,g_north_west,x_60,y_40/fl_attachment/v1/rajneet/cover-bg`;

    return url;
  } catch (error) {
    console.error("Cover image generation error:", error);
    // Return a Cloudinary URL with just text overlay as fallback
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const encodedHeadline = encodeURIComponent(headline.substring(0, 50).replace(/[^a-zA-Z0-9\s]/g, ""));
    return `https://res.cloudinary.com/${cloudName}/image/upload/w_1200,h_630,c_fill,b_rgb:0a0f1e/l_text:Arial_40_bold:${encodedHeadline},co_white,g_center/v1/rajneet/cover-bg`;
  }
}
