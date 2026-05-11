import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function callGroqWithRetry(prompt: string, maxRetries = 2): Promise<string> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.GROQ_API_KEY}` 
          },
          body: JSON.stringify({
            model: 'llama-3.1-8b-instant',
            messages: [
              {
                role: 'user',
                content: prompt
              }
            ],
            max_tokens: 500,
            temperature: 0.7
          })
        }
      )

      if (response.status === 429) {
        const waitTime = attempt * 5000 // only 5s wait, Groq recovers fast
        console.log(`Groq rate limited. Waiting ${waitTime/1000}s`)
        await new Promise(resolve => setTimeout(resolve, waitTime))
        continue
      }

      if (!response.ok) {
        const err = await response.text()
        throw new Error(`Groq error ${response.status}: ${err}`)
      }

      const data = await response.json()
      return data.choices?.[0]?.message?.content?.trim() || ''

    } catch (err) {
      if (attempt === maxRetries) {
        console.error('Groq failed after retries:', err)
        return ''
      }
      await new Promise(resolve => setTimeout(resolve, 2000))
    }
  }
  return ''
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch articles with short or missing seo_body
    const articles = await prisma.news.findMany({
      where: {
        status: "PUBLISHED",
        OR: [
          { seo_body: null },
          { seo_body: "" },
          { seo_body: { lt: " " } },
          { seo_body: { contains: "Original news:" } },
          { seo_body: { contains: "Original:" } },
          { summary: { contains: "Original news:" } },
        ],
      },
      orderBy: { created_at: "desc" },
      take: 50,
    });

    const fixed = [];
    const failed = [];

    for (const article of articles) {
      try {
        const summaryPrompt = `You are a senior political journalist writing for RAJNEET, India's top civic debate platform.

Write a DETAILED news article for this story. This is NOT a summary. This is a full article.

STRICT REQUIREMENTS:
- Minimum 300 words, maximum 400 words
- Write exactly 4 paragraphs
- Paragraph 1 (Lead): What happened, who was involved, when and where. Most important facts first. 4-5 sentences.
- Paragraph 2 (Background): Context and background. Why did this happen. What led to this moment. 4-5 sentences.
- Paragraph 3 (Impact): How does this affect Indian citizens directly. What changes for common people. What are experts or opposition saying. 4-5 sentences.
- Paragraph 4 (Debate): What are the two sides of this issue. End with a question inviting readers to share their stance on RAJNEET.
- Write in simple clear English that any Indian citizen can understand
- Do NOT use: "delve", "crucial", "realm", "furthermore", "moreover", "it is worth noting", "in conclusion"
- Do NOT start with "Original news:" or any wire service attribution
- Do NOT copy text from the source
- Return ONLY the article text with paragraph breaks. Nothing else.

Headline: ${article.headline}
Category: ${article.category}
Raw source content: ${article.summary}`;

        const generatedBody = await callGroqWithRetry(summaryPrompt);

        // Validate the generated body
        const isValid = generatedBody.length >= 800 && 
                       generatedBody.split(' ').length >= 150 &&
                       !generatedBody.toLowerCase().startsWith('original news') &&
                       generatedBody.split('\n\n').length >= 3;

        if (!isValid) {
          console.log(`Skipping invalid body for article ${article.id}`);
          failed.push(article.id);
          continue;
        }

        // Update the article with the full body and a clean summary
        await prisma.news.update({
          where: { id: article.id },
          data: {
            seo_body: generatedBody,
            summary: generatedBody.substring(0, 300),
          },
        });

        fixed.push(article.id);
        console.log(`Fixed article ${article.id}: ${article.headline}`);
      } catch (error) {
        console.error(`Failed to fix article ${article.id}:`, error);
        failed.push(article.id);
      }
    }

    return NextResponse.json({
      success: true,
      fixed: fixed.length,
      failed: failed.length,
      fixedIds: fixed,
      failedIds: failed,
    });
  } catch (error: any) {
    console.error("Fix all summaries error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
