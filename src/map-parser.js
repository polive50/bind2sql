export function parseMap(input = '') {
  const values = new Map();
  const text = input.trim().replace(/^\{/, '').replace(/\}$/, '');
  for (const part of text.split(/[\n,]+/)) {
    const match = part.trim().match(/^([^=:\s]+)\s*(?:=|:)\s*(.*?)\s*$/);
    if (match && match[1]) values.set(match[1], match[2]);
  }
  return values;
}
