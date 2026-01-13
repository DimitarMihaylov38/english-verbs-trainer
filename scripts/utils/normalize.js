export function normalizeInput(value) {
  return value.trim().toLowerCase();
}

export function splitVariants(value) {
  return value
    .toLowerCase()
    .split('/')
    .map(v => v.trim());
}
