const cache = new Map();

const getCache = (key) => cache.get(key);
const setCache = (key, value) => cache.set(key, value);

module.exports = { getCache, setCache };