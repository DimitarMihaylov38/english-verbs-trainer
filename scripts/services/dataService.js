const cache = new Map();

async function loadJson(path) {
  if (cache.has(path)) return cache.get(path);

  const res = await fetch(path);
  if (!res.ok) {
    throw new Error(`Не мога да заредя: ${path} (${res.status})`);
  }

  const data = await res.json();
  cache.set(path, data);
  return data;
}

export async function loadIrregular(level) {
  const map = {
    easy: './data/irregularVerbsPart1.json',
    medium: './data/irregularVerbsPart2.json',
    hard: './data/irregularVerbsPart3.json',
  };

  const path = map[level];
  if (!path) throw new Error('Невалидно ниво за irregular.');
  return loadJson(path);
}

export async function loadPhrasal(level) {
  const map = {
    easy: './data/phrasalVerbs1.json',
    hard: './data/phrasalVerbs2.json',
  };

  const path = map[level];
  if (!path) throw new Error('Невалидно ниво за phrasal.');
  return loadJson(path);
}

