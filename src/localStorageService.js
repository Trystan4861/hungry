export const localStorageService = {
  setItem(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
    return value; 
  },
  getItem(key) {
    let item = localStorage.getItem(key);
    try{ item=JSON.parse(item) }
    catch(err){ item=null }
    return item;
  },
  removeItem(key) {localStorage.removeItem(key);}
};
