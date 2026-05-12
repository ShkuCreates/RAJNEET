// Test file to demonstrate the multiple API key implementation
// This file shows how the fallback mechanism works

const NEWSDATA_API_KEYS = [
  // Replace these with your valid API keys from https://newsdata.io
  // "your_valid_api_key_1",
  // "your_valid_api_key_2",
  // "your_valid_api_key_3"
];

async function fetchFromNewsDataWithFallback(query) {
  const results = [];
  const errors = [];
  
  console.log('Testing multiple API key implementation...');
  console.log('Available API keys:', NEWSDATA_API_KEYS.length);
  
  for (const apiKey of NEWSDATA_API_KEYS) {
    if (!apiKey) {
      continue; // Skip null/undefined keys
    }
    
    try {
      console.log(`Trying API key: ${apiKey.substring(0, 10)}...`);
      
      const response = await fetch(
        `https://newsdata.io/api/1/news?apikey=${apiKey}&q=${encodeURIComponent(query)}&language=en&size=10`
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[NEWSDATA_API_ERROR] Key ${apiKey.substring(0, 10)}...:`, response.status, errorText);
        
        // If it's a rate limit (429) or quota issue, try next key
        if (response.status === 429 || response.status === 401 || response.status === 403) {
          errors.push(`Key ${apiKey.substring(0, 10)}...: ${response.status} - Rate limited/Quota exceeded`);
          continue;
        }
        
        // For other errors like 422 (invalid parameters), don't retry with other keys
        if (response.status === 422) {
          throw new Error(`Invalid parameter: ${errorText}`);
        }
        
        errors.push(`Key ${apiKey.substring(0, 10)}...: ${response.status} - ${errorText}`);
        continue;
      }

      const contentType = response.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        errors.push(`Key ${apiKey.substring(0, 10)}...: Invalid response type`);
        continue;
      }

      const data = await response.json();
      
      if (!data.results) {
        errors.push(`Key ${apiKey.substring(0, 10)}...: No results in response`);
        continue;
      }
      
      console.log(`✓ Success with key ${apiKey.substring(0, 10)}...: ${data.results.length} articles`);
      results.push(...data.results);
      
      // If we got results, don't try more keys unless we need more articles
      if (results.length >= 15) {
        break;
      }
      
    } catch (error) {
      console.error(`Key ${apiKey.substring(0, 10)}... failed:`, error.message);
      errors.push(`Key ${apiKey.substring(0, 10)}...: ${error.message}`);
      
      // If it's a parameter error, don't continue
      if (error.message.includes('Invalid parameter')) {
        throw error;
      }
      continue;
    }
  }
  
  if (results.length === 0) {
    throw new Error(`All API keys failed. Errors: ${errors.join('; ')}`);
  }
  
  return { results: results.slice(0, 15) }; // Limit to 15 total articles
}

// Example usage
async function test() {
  try {
    if (NEWSDATA_API_KEYS.length === 0) {
      console.log('❌ No API keys configured. Please add valid API keys to the NEWSDATA_API_KEYS array.');
      console.log('Get your API keys from: https://newsdata.io');
      return;
    }
    
    const data = await fetchFromNewsDataWithFallback("politics India");
    console.log(`\n✅ Success! Fetched ${data.results.length} articles`);
    console.log('First article:', data.results[0]?.title);
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.log('\nTo fix this issue:');
    console.log('1. Get valid API keys from https://newsdata.io');
    console.log('2. Add them to the NEWSDATA_API_KEYS array in this file');
    console.log('3. Or set them as environment variables: NEWSDATA_API_KEY, NEWSDATA_API_KEY_2, etc.');
  }
}

test();
