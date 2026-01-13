
import { splitVariants, normalizeInput } from '../utils/normalize.js';
import { shuffle, sample } from '../utils/shuffle.js';

export function buildIrregularQuestions(items, count = 20) {
  const picked = sample(items, Math.min(count, items.length));

  return picked.map(v => ({
    kind: 'irregular',
    base: v.base,
    translation: v.translation,
    pastVariants: splitVariants(v.past),
    partVariants: splitVariants(v.participle),
  }));
}

export function buildPhrasalQuestions(items, mode = 'en-bg', count = 20) {
  const picked = sample(items, Math.min(count, items.length));
  const all = items;

  return picked.map(item => {
    const isEnBg = mode === 'en-bg';

    const prompt = isEnBg ? item.verb : item.translation;
    const correctDisplay = isEnBg ? item.translation : item.verb;

    const correctNorm = normalizeInput(correctDisplay);

    // pool от уникални кандидати по НОРМАЛИЗИРАН текст
    const poolMap = new Map(); // norm -> display
    for (const x of all) {
      const display = isEnBg ? x.translation : x.verb;
      if (!display) continue;

      const norm = normalizeInput(display);
      if (!norm) continue;
      if (norm === correctNorm) continue;

      // пазим първото срещане за този norm
      if (!poolMap.has(norm)) poolMap.set(norm, display);
    }

    const pool = [...poolMap.values()];

    // взимаме до 4 грешни (уникални по norm)
    const wrong = sample(pool, Math.min(4, pool.length));

    // сглобяваме опциите уникално по norm и гарантираме correct вътре
    const optionsMap = new Map(); // norm -> display
    optionsMap.set(correctNorm, correctDisplay);

    for (const w of wrong) {
      optionsMap.set(normalizeInput(w), w);
    }

    // ако поради малък pool или дублиране станат < 5, допълваме
    if (optionsMap.size < 5) {
      for (const cand of shuffle(pool)) {
        const n = normalizeInput(cand);
        if (!optionsMap.has(n) && n !== correctNorm) {
          optionsMap.set(n, cand);
        }
        if (optionsMap.size === 5) break;
      }
    }

    const options = shuffle([...optionsMap.values()]);

    return {
      kind: 'phrasal',
      mode,
      prompt,
      correct: correctDisplay,
      options,
      verb: item.verb,
      translation: item.translation,
    };
  });
}

export function checkIrregularAnswer(question, pastInput, partInput) {
  const p = normalizeInput(pastInput);
  const pp = normalizeInput(partInput);

  const okPast = question.pastVariants.includes(p);
  const okPart = question.partVariants.includes(pp);

  return {
    isCorrect: okPast && okPart,
    okPast,
    okPart
  };
}

export function checkPhrasalAnswer(question, chosen) {
  const c = normalizeInput(chosen);
  const corr = normalizeInput(question.correct);

  console.log('CHOSEN:', chosen, '| norm:', c);
  console.log('CORRECT:', question.correct, '| norm:', corr);

  return corr === c;
}


