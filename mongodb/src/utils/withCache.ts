import NodeCache from 'node-cache';

const withCache = async (
  cache: NodeCache,
  cacheKey: string,
  callback: () => any
) => {
  const cachedData = cacheKey
    ? JSON.parse(cache.get(cacheKey) || 'null')
    : null;
  if (cachedData) {
    console.log(`Cached: ${JSON.stringify(cachedData)}`);
    return cachedData;
  }
  const fetchedData = await callback();
  console.log(`Fetched: ${JSON.stringify(fetchedData)}`);
  cache.set(cacheKey, JSON.stringify(fetchedData));
  return fetchedData;
};

export default withCache;
