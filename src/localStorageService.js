export const localStorageService = {
  setSubItem(subKey, value,key="hungryConfigData"){
    let storedData = JSON.parse(localStorage.getItem(key)) || {};
    storedData[subKey] = value;
    localStorage.setItem(key, JSON.stringify(storedData));
    return value; 
  },
  getSubItem(subKey,key="hungryConfigData"){
    let storedData = JSON.parse(localStorage.getItem(key));
    if (!storedData || !(Object.prototype.hasOwnProperty.call(storedData, subKey))) return null;
    return storedData[subKey];
  },
  removeItem(key="hungryConfigData"){
    localStorage.removeItem(key);
  },
  setItem(value, key="hungryConfigData"){
    localStorage.setItem(key, JSON.stringify(value));
    return value;
  }
};
