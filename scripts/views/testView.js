
import { render } from '../app.js';
import { state } from '../state.js';
import { showResult } from './resultView.js';
import { loadIrregular, loadPhrasal } from '../services/dataService.js';
import {
  buildIrregularQuestions,
  buildPhrasalQuestions,
  checkIrregularAnswer,
  checkPhrasalAnswer
} from '../services/testEngine.js';

export async function startTest(type, level, mode = null, repeatQuestions = null) {
  state.type = type;
  state.level = level;
  state.mode = mode;

  state.currentIndex = 0;
  state.correct = 0;
  state.wrong = [];

  if (repeatQuestions) {
    state.questions = repeatQuestions.slice(0, 20);
    showQuestion();
    return;
  }

  if (type === 'irregular') {
    const data = await loadIrregular(level);
    state.questions = buildIrregularQuestions(data, 20);
  } else {
    const data = await loadPhrasal(level);
    state.questions = buildPhrasalQuestions(data, mode ?? 'en-bg', 20);
  }

  showQuestion();
}

function showQuestion() {
  if (state.currentIndex >= state.questions.length) {
    showResult();
    return;
  }

  const q = state.questions[state.currentIndex];
  if (q.kind === 'irregular') renderIrregular(q);
  else renderPhrasal(q);
}

function goNext() {
  state.currentIndex++;
  showQuestion();
}

function renderIrregular(q) {
  const section = document.createElement('section');
  section.innerHTML = `
    <h3>Въпрос ${state.currentIndex + 1} / ${state.questions.length}</h3>
    <p><b>${q.base}</b> — ${q.translation}</p>

    <label>Past Simple:</label><br/>
    <input id="past" autocomplete="off" inputmode="text" /><br/><br/>

    <label>Past Participle:</label><br/>
    <input id="part" autocomplete="off" inputmode="text" /><br/><br/>

    <div id="feedback" style="min-height: 36px; margin: 0.9rem 0; font-weight: bold;"></div>

    <button id="submit">Провери</button>
  `;

  const pastEl = section.querySelector('#past');
  const partEl = section.querySelector('#part');
  const feedback = section.querySelector('#feedback');
  const submitBtn = section.querySelector('#submit');

  let submitted = false;

  function lock() {
    pastEl.disabled = true;
    partEl.disabled = true;
    submitBtn.disabled = true;
  }

  function nextAfter(ms) {
    setTimeout(() => {
      state.currentIndex++;
      showQuestion();
    }, ms);
  }

  function submit() {
    if (submitted) return;
    submitted = true;

    const res = checkIrregularAnswer(q, pastEl.value, partEl.value);

    if (res.isCorrect) {
      state.correct++;
      feedback.textContent = 'Правилно ✅';
      feedback.className = 'result-success';

      lock();
      nextAfter(700);
    } else {
      state.wrong.push({
        question: q,
        user: { past: pastEl.value, part: partEl.value }
      });

      const correctPast = q.pastVariants.join('/');
      const correctPart = q.partVariants.join('/');

      feedback.textContent = `Грешно ❌  |  вярно: ${correctPast} / ${correctPart}`;
      feedback.className = 'result-fail';

      lock();
      nextAfter(2000);
    }
  }

  submitBtn.addEventListener('click', submit);

  // Enter UX:
  pastEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') partEl.focus();
  });

  partEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') submit();
  });

  render(section);
  pastEl.focus();
}


function renderPhrasal(q) {
  const section = document.createElement('section');
  section.innerHTML = `
    <h3>Въпрос ${state.currentIndex + 1} / ${state.questions.length}</h3>
    <p><b>${q.prompt}</b></p>

    <div id="opts" style="display:flex; flex-direction:column; gap:0.5rem;"></div>

    <div id="feedback" style="min-height: 36px; margin: 0.9rem 0; font-weight: bold;"></div>
  `;

  const opts = section.querySelector('#opts');
  const feedback = section.querySelector('#feedback');

  let answered = false;

  function lockOptions() {
    [...opts.querySelectorAll('button')].forEach(b => b.disabled = true);
  }

  function nextAfter(ms) {
    // твърд next – само оттук минава
    setTimeout(() => {
      state.currentIndex++;
      showQuestion();
    }, ms);
  }

  q.options.forEach(opt => {
    const btn = document.createElement('button');
    btn.className = 'secondary';
    btn.type = 'button';
    btn.textContent = opt;

    btn.addEventListener('click', () => {
      if (answered) return;
      answered = true;

      const ok = checkPhrasalAnswer(q, opt);

      lockOptions();

      if (ok) {
        state.correct++;
        feedback.textContent = 'Правилно ✅';
        feedback.className = 'result-success';

        console.log('PHRASAL delay=700ms');
        nextAfter(700);
      } else {
        state.wrong.push({ question: q, user: { chosen: opt } });

        feedback.textContent = `Грешно ❌  |  Вярно: ${q.correct}`;
        feedback.className = 'result-fail';

        console.log('PHRASAL delay=2000ms');
        nextAfter(2000);
      }
    });

    opts.appendChild(btn);
  });

  render(section);
}




