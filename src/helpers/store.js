async function removeStoreItem(key) {
  try {
    await localStorage.removeItem(key);
    return true;
  } catch (e) {
    return false;
  }
}

async function getStoreData(key) {
  try {
    return localStorage.getItem(key);
  } catch (e) {
    console.log(`Loading error: ${e}`);
    return false;
  }
}

async function storeData(key, value) {
  try {
    return localStorage.setItem(key, value);
  } catch (e) {
    console.log(`Saving error: ${e}`);
    return false;
  }
}

export { removeStoreItem, getStoreData, storeData };
