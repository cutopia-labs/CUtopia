async function removeStoreItem(key: string) {
  try {
    await localStorage.removeItem(key);
    return true;
  } catch (e) {
    return false;
  }
}

async function getStoreData(key: string) {
  try {
    return JSON.parse(localStorage.getItem(key));
  } catch (e) {
    console.log(`Loading error: ${e}`);
    return '';
  }
}

async function storeData(key: string, value: any) {
  try {
    return localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.log(`Saving error: ${e}`);
    return '';
  }
}

async function clearStore() {
  localStorage.clear();
}

export { removeStoreItem, getStoreData, storeData, clearStore };
