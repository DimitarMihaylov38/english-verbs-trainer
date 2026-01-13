import { showHome } from './views/homeView.js';

const app = document.getElementById('app');

export function render(html) {
  app.innerHTML = '';
  app.appendChild(html);
}

try {
  showHome();
} catch (err) {
  console.error(err);
  app.textContent = 'Има грешка в приложението. Отвори конзолата (F12).';
}

