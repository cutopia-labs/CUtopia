export function removeStoreItem(key: string) {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (e) {
    return false;
  }
}

export function getStoreData(key: string, parse = true) {
  try {
    const value = localStorage.getItem(key);
    return parse ? JSON.parse(value) : value;
  } catch (e) {
    return localStorage.getItem(key);
  }
}

export function storeData(key: string, value: any, stringify = true) {
  try {
    return localStorage.setItem(key, stringify ? JSON.stringify(value) : value);
  } catch (e) {
    return '';
  }
}

export function clearStore() {
  localStorage.clear();
}
