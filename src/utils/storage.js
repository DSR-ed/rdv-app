const STORAGE_KEY = 'rdv_app_items_v1';

export function getAll() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Storage getAll error', e);
    return [];
  }
}

export function saveAll(items) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    console.error('Storage saveAll error', e);
  }
}

export function upsert(item) {
  const items = getAll();
  const idx = items.findIndex(x => x.id === item.id);
  if (idx >= 0) items[idx] = item; else items.unshift(item);
  saveAll(items);
  return item;
}

export function remove(id) {
  const items = getAll().filter(x => x.id !== id);
  saveAll(items);
}

export function getById(id) {
  return getAll().find(x => x.id === id);
}
