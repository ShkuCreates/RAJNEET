import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "url required" }, { status: 400 });
  }

  try {
    const { extract } = await import("@extractus/article-extractor");

    const article = await extract(url, {
      wordsPerMinute: 300,
      descriptionLengthThreshold: 40,
    });

    return NextResponse.json({
      title: article?.title,
      content: article?.content,
      description: article?.description,
      image: article?.image,
      published: article?.published,
      source: article?.source,
    });
  } catch (error) {
    console.error("Error extracting article:", error);
    return NextResponse.json(
      { error: "Failed to extract article" },
      { status: 500 }
    );
  }
}
