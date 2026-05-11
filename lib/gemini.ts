export async function generateNewsSummary(content: string): Promise<string> {
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
              content: `Summarize this news article in 800-1000 words. Focus on:
    - Key facts and information
    - Important context and implications
    - Actionable insights
    - Keep it factual and objective
    - Use clear, concise language
    - Make it detailed and comprehensive (aim for 800-1000 words)
    
    Article content:
    ${content}
    
    Provide a comprehensive summary that captures the essence of the article while being informative and engaging. Ensure the summary is substantial and detailed.`
            }
          ],
          max_tokens: 1000,
          temperature: 0.7
        })
      }
    )

    if (!response.ok) {
      const err = await response.text()
      throw new Error(`Groq error ${response.status}: ${err}`)
    }

    const data = await response.json()
    return data.choices?.[0]?.message?.content?.trim() || ''
    
  } catch (error) {
    console.error('Error generating summary with Groq:', error);
    throw new Error('Failed to generate summary');
  }
}
