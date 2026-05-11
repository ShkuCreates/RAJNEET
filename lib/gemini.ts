import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function generateNewsSummary(content: string): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const prompt = `Summarize this news article in 800-1000 words. Focus on:
    - Key facts and information
    - Important context and implications
    - Actionable insights
    - Keep it factual and objective
    - Use clear, concise language
    - Make it detailed and comprehensive (aim for 800-1000 words)
    
    Article content:
    ${content}
    
    Provide a comprehensive summary that captures the essence of the article while being informative and engaging. Ensure the summary is substantial and detailed.`;

    const result = await model.generateContent(prompt);
    const summary = result.response.text();
    
    return summary;
  } catch (error) {
    console.error('Error generating summary with Gemini:', error);
    throw new Error('Failed to generate summary');
  }
}
