const DEVICE_STORAGE_KEY = 'apppacha.website.device.id';

export function getDeviceId() {
  const saved = localStorage.getItem(DEVICE_STORAGE_KEY);
  if (saved) return saved;

  const id = crypto.randomUUID?.() ?? Date.now() + '-' + Math.random().toString(16).slice(2);
  localStorage.setItem(DEVICE_STORAGE_KEY, id);
  return id;
}
