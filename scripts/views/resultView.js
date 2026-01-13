import { render } from '../app.js';
import { state } from '../state.js';
import { saveResult, getLastResult, getBestResult, clearResults } from '../services/storageService.js';
import { showHome } from './homeView.js';
import { startTest } from './testView.js';

export function showResult() {
  saveResult(state.type, state.level, state.correct, state.questions.length);

  const last = getLastResult(state.type, state.level);
  const best = getBestResult(state.type, state.level);

  const section = document.createElement('section');

  const cls = state.correct >= 10 ? 'result-success' : 'result-fail';

  section.innerHTML = `
    <h2>Резултат</h2>

    <p class="${cls}">
      Ти направи ${state.correct} от ${state.questions.length} въпроса
    </p>

    <p>Последен: ${last?.score ?? '-'} / ${last?.total ?? '-'} (${last?.date ?? '-'})</p>
    <p>Най-добър: ${best?.score ?? '-'} / ${best?.total ?? '-'} (${best?.date ?? '-'})</p>

    <div style="margin-top: 1rem;">
      <button id="home">Начало</button>
      <button id="repeat" class="secondary">Повтори грешните (${state.wrong.length})</button>
      <button id="clear" class="secondary">Изчисти резултати</button>
    </div>

    <div id="wrongBox" style="margin-top: 1rem;"></div>
  `;

  section.querySelector('#home').addEventListener('click', showHome);

  section.querySelector('#repeat').addEventListener('click', () => {
    if (state.wrong.length === 0) return;

    const repeatQuestions = state.wrong.map(x => x.question);
    startTest(state.type, state.level, state.mode, repeatQuestions);
  });

  section.querySelector('#clear').addEventListener('click', () => {
    clearResults();
    showHome();
  });

  // показваме грешните (кратко)
  const wrongBox = section.querySelector('#wrongBox');
  if (state.wrong.length > 0) {
    const ul = document.createElement('ul');
    state.wrong.slice(0, 20).forEach(w => {
      const li = document.createElement('li');
      if (w.question.kind === 'irregular') {
        li.textContent = `${w.question.base}: вярно = ${w.question.pastVariants.join('/')} , ${w.question.partVariants.join('/')} | ти въведе = ${w.user.past || '-'} , ${w.user.part || '-'}`;
      } else {
        li.textContent = `${w.question.prompt}: вярно = ${w.question.correct} | ти въведе = ${w.user.chosen}`;
      }
      ul.appendChild(li);
    });
    wrongBox.appendChild(ul);
  }

  render(section);
}

