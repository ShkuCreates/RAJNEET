-- Cleanup news.category to EXACTLY ONE of: Politics, Finance, Sports, World
-- IMPORTANT: Run this migration against your Render PostgreSQL before/after deploying.

BEGIN;

-- Politics
UPDATE "News" 
SET category = 'Politics'
WHERE category ILIKE ANY (ARRAY[
  '%POLITICAL%','%POLITICS%','%political%','%crime%','%CRIME%','%infrastructure%','%INfrastructure%','%SOCIAL%','%environment%','%HEALTH%','%EDUCATION%','%GOVERNANCE%','%LAW%','%ENTERTAINMENT%','%DOMESTIC%','%International%','%international%'
]);

-- Finance
UPDATE "News"
SET category = 'Finance'
WHERE category ILIKE ANY (ARRAY[
  '%FINANCE%','%FINANCIAL%','%business%','%BUSINESS%','%corporate%','%CORPORATE%','%economy%','%ECONOMY%','%technology%','%TECHNOLOGY%','%science%','%SCIENCE%','%market%','%MARKET%','%startup%','%STARTUP%'
]);

-- Sports
UPDATE "News"
SET category = 'Sports'
WHERE category ILIKE ANY (ARRAY[
  '%SPORT%','%CRICKET%','%FOOTBALL%','%IPL%','%OLYMPICS%','%FIFA%'
]);

-- World
UPDATE "News"
SET category = 'World'
WHERE category ILIKE ANY (ARRAY[
  '%WORLD%','%INTERNATIONAL%','%FOREIGN%','%GLOBAL%','%DIPLOMACY%'
]);

-- Anything still not in the 4 valid categories becomes Politics
UPDATE "News"
SET category = 'Politics'
WHERE category NOT IN ('Politics','Finance','Sports','World');

-- Verify
SELECT category, COUNT(*) as count
FROM "News"
GROUP BY category
ORDER BY count DESC;

COMMIT;

