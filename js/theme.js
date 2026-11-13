const THEME_KEY = 'arenaTheme';

function getTheme() {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    return saved === 'light' ? 'light' : 'dark';
  } catch (e) {
    return 'dark';
  }
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-bs-theme', theme);
  document.querySelectorAll('.navbar').forEach(function (nav) {
    nav.setAttribute('data-bs-theme', theme);
  });
  const button = document.getElementById('themeToggle');
  if (button) {
    const toLight = theme === 'dark';
    button.setAttribute('aria-label', toLight ? 'Switch to light mode' : 'Switch to dark mode');
    button.setAttribute('title', toLight ? 'Light mode' : 'Dark mode');
    button.querySelector('i').className = 'bi ' + (toLight ? 'bi-sun-fill' : 'bi-moon-stars-fill');
  }
}

function saveTheme(theme) {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch (e) {
    return;
  }
}

applyTheme(getTheme());

document.addEventListener('DOMContentLoaded', function () {
  applyTheme(getTheme());
  const button = document.getElementById('themeToggle');
  if (button) {
    button.addEventListener('click', function () {
      const next = document.documentElement.getAttribute('data-bs-theme') === 'dark' ? 'light' : 'dark';
      saveTheme(next);
      applyTheme(next);
    });
  }
});