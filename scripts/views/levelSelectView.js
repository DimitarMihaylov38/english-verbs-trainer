import { render } from '../app.js';
import { startTest } from './testView.js';

export function showLevelSelect(type) {
  const levels = type === 'irregular'
    ? ['easy', 'medium', 'hard']
    : ['easy', 'hard'];

  const section = document.createElement('section');
  section.innerHTML = `<h2>Избери ниво</h2>`;

  levels.forEach(level => {
    const btn = document.createElement('button');
    btn.textContent = level.toUpperCase();

    btn.addEventListener('click', () => {
      if (type === 'phrasal') {
        showPhrasalModePick(level);
      } else {
        startTest(type, level);
      }
    });

    section.appendChild(btn);
  });

  render(section);
}

function showPhrasalModePick(level) {
  const section = document.createElement('section');
  section.innerHTML = `
    <h2>Phrasal режим</h2>
    <p>Избери посока:</p>
    <button id="enbg">EN → BG</button>
    <button id="bgen" class="secondary">BG → EN</button>
  `;

  section.querySelector('#enbg').addEventListener('click', () => startTest('phrasal', level, 'en-bg'));
  section.querySelector('#bgen').addEventListener('click', () => startTest('phrasal', level, 'bg-en'));

  render(section);
}
