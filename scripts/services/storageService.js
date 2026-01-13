const KEY = 'verbTrainerResults';

function getData() {
  return JSON.parse(localStorage.getItem(KEY)) || {};
}

function saveData(data) {
  localStorage.setItem(KEY, JSON.stringify(data));
}

export function saveResult(type, level, score, total) {
  const data = getData();
  data[type] ??= {};
  data[type][level] ??= [];

  data[type][level].push({
    score,
    total,
    date: new Date().toLocaleString()
  });

  saveData(data);
}

export function getLastResult(type, level) {
  const data = getData();
  const list = data[type]?.[level] || [];
  return list[list.length - 1];
}

export function getBestResult(type, level) {
  const data = getData();
  const list = data[type]?.[level] || [];
  if (list.length === 0) return null;

  return list.reduce((best, cur) => (cur.score > best.score ? cur : best), list[0]);
}

export function clearResults() {
  localStorage.removeItem(KEY);
}

