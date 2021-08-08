const reverseMapping = (obj: Record<string, any>) =>
  Object.fromEntries(Object.entries(obj).map(([k, v]) => [v, k]));

export default reverseMapping;
