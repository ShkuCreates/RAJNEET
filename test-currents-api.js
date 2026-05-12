// Test script to verify Currents API integration
const API_CONFIGS = {
  newsdata: {
    keys: [
      "5gRpK5NKilKfCPdtkvC2oEZBFHNuT-z1bbozEY6Cq42JY--H"
    ].filter(Boolean),
    baseUrl: "https://newsdata.io/api/1/news",
    queryParams: "&language=en&size=5"
  },
  currents: {
    keys: [
      // Add your Currents API key here
      // "your_currents_api_key"
    ].filter(Boolean),
    baseUrl: "https://api.currentsapi.services/v1/search",
    queryParams: "&language=en&limit=5"
  },
  gnews: {
    keys: [
      "4d0204f121a0846d1a8a1096d5352f08"
    ].filter(Boolean),
    baseUrl: "https://gnews.io/api/v4/search",
    queryParams: "&lang=en&max=5&sortby=publishedAt"
  }
};

function normalizeArticle(article, source) {
  switch (source) {
    case 'newsdata':
      return {
        title: article.title,
        description: article.description,
        link: article.link,
        pubDate: article.pubDate,
        source: 'newsdata'
      };
    
    case 'currents':
      return {
        title: article.title,
        description: article.description,
        link: article.url,
        pubDate: article.published,
        source: 'currents'
      };
    
    case 'gnews':
      return {
        title: article.title,
        description: article.description,
        link: article.url,
        pubDate: article.publishedAt,
        source: 'gnews'
      };
    
    default:
      return article;
  }
}

async function testAPI(apiName, query) {
  const config = API_CONFIGS[apiName];
  if (!config || config.keys.length === 0) {
    console.log(`❌ No API keys configured for ${apiName}`);
    return [];
  }

  console.log(`\n🔍 Testing ${apiName} API...`);
  
  for (const apiKey of config.keys) {
    try {
      console.log(`Trying ${apiName} API key: ${apiKey.substring(0, 10)}...`);
      
      let url = `${config.baseUrl}?`;
      
      if (apiName === 'newsdata') {
        url += `apikey=${apiKey}&q=${encodeURIComponent(query)}${config.queryParams}`;
      } else if (apiName === 'currents') {
        url += `apiKey=${apiKey}&keywords=${encodeURIComponent(query)}${config.queryParams}`;
      } else if (apiName === 'gnews') {
        url += `token=${apiKey}&q=${encodeURIComponent(query)}${config.queryParams}`;
      }
      
      const response = await fetch(url);
      console.log(`Status: ${response.status}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.log(`❌ Error: ${response.status} - ${errorText}`);
        continue;
      }

      const data = await response.json();
      let articles = [];
      
      if (apiName === 'newsdata' && data.results) {
        articles = data.results;
      } else if (apiName === 'currents' && data.news) {
        articles = data.news;
      } else if (apiName === 'gnews' && data.articles) {
        articles = data.articles;
      }
      
      if (articles.length > 0) {
        console.log(`✅ Success! Found ${articles.length} articles from ${apiName}`);
        const normalizedArticles = articles.map(article => normalizeArticle(article, apiName));
        console.log(`First article: ${normalizedArticles[0].title}`);
        return normalizedArticles;
      } else {
        console.log(`❌ No articles found`);
      }
      
    } catch (error) {
      console.log(`❌ ${apiName} API failed:`, error.message);
      continue;
    }
  }
  
  return [];
}

async function testAllAPIs() {
  console.log('🚀 Testing Multi-API News Fetching System with Currents API');
  console.log('================================================================');
  
  const query = "politics India";
  const allResults = [];
  const apiNames = ['newsdata', 'currents', 'gnews'];
  
  // Test each API
  for (const apiName of apiNames) {
    const results = await testAPI(apiName, query);
    allResults.push(...results);
  }
  
  // Remove duplicates
  const uniqueArticles = [];
  const seenUrls = new Set();
  
  for (const article of allResults) {
    if (article.link && !seenUrls.has(article.link)) {
      seenUrls.add(article.link);
      uniqueArticles.push(article);
    }
  }
  
  console.log(`\n📊 SUMMARY`);
  console.log('===========');
  console.log(`Total articles from all APIs: ${allResults.length}`);
  console.log(`Unique articles after deduplication: ${uniqueArticles.length}`);
  
  console.log('\n🎯 ARTICLES BY SOURCE:');
  apiNames.forEach(apiName => {
    const count = uniqueArticles.filter(a => a.source === apiName).length;
    if (count > 0) {
      console.log(`- ${apiName}: ${count} articles`);
    }
  });
  
  console.log('\n✅ Multi-API system with Currents API test completed!');
}

testAllAPIs().catch(console.error);
