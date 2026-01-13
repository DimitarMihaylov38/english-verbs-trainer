import { render } from '../app.js';
import { showLevelSelect } from './levelSelectView.js';

export function showHome() {
  const section = document.createElement('section');

  section.innerHTML = `
    <h2>Избери тип тест</h2>
    <button id="irregular">Irregular Verbs</button>
    <button id="phrasal">Phrasal Verbs</button>
  `;

  section.querySelector('#irregular')
    .addEventListener('click', () => showLevelSelect('irregular'));

  section.querySelector('#phrasal')
    .addEventListener('click', () => showLevelSelect('phrasal'));

  render(section);
}
