// src/helpers/localStorage.js
export function loadLocal(key, def = []) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : def;
    } catch (e) {
      return def;
    }
  }
  
  export function saveLocal(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {}
  }
  