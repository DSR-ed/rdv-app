const THEME_KEY = 'theme';

export function getStoredTheme() {
  try { return localStorage.getItem(THEME_KEY) || ''; } catch { return ''; }
}

export function getPreferredTheme() {
  const stored = getStoredTheme();
  if (stored === 'light' || stored === 'dark') return stored;
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  return prefersDark ? 'dark' : 'light';
}

export function applyTheme(theme) {
  const t = theme === 'dark' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', t);
}

export function setTheme(theme) {
  try { localStorage.setItem(THEME_KEY, theme); } catch {}
  applyTheme(theme);
}

export function toggleTheme() {
  const current = (document.documentElement.getAttribute('data-theme') || getPreferredTheme());
  const next = current === 'dark' ? 'light' : 'dark';
  setTheme(next);
  return next;
}

export function initTheme() {
  applyTheme(getPreferredTheme());
  // react to OS changes if no explicit user choice
  if (!getStoredTheme() && window.matchMedia) {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => applyTheme(mq.matches ? 'dark' : 'light');
    mq.addEventListener?.('change', handler);
  }
}
