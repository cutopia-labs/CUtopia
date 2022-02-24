import NodeCache from 'node-cache';

const withCache = async (
  cache: NodeCache,
  cacheKey: string,
  callback: () => any,
  fetchIf?: (cached: any) => any // fetch data if it returns truthy value
) => {
  if (!cacheKey) {
    return;
  }
  const cachedData = JSON.parse(cache.get(cacheKey) || 'null');
  if (cachedData && (!fetchIf || !(await fetchIf(cachedData)))) {
    // console.log(`Cached: ${JSON.stringify(cachedData)}`);
    return cachedData;
  }
  const fetchedData = await callback();
  // console.log(`Fetched: ${JSON.stringify(fetchedData)}`);
  if (fetchedData) {
    cache.set(cacheKey, JSON.stringify(fetchedData));
  }
  return fetchedData;
};

export default withCache;
