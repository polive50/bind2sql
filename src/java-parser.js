import { substituteParameters, formatSql } from './sql.js';

const setters = new Set(['String','Int','Long','Short','Byte','Boolean','BigDecimal','Double','Float','Date','Timestamp','Time','Null']);
function javaString(value) { try { return JSON.parse(`"${value.replace(/"/g, '\\"')}"`).replace(/\\'/g, "'"); } catch { return value.replace(/\\"/g, '"').replace(/\\'/g, "'").replace(/\\n/g, '\n').replace(/\\\\/g, '\\'); } }
function stringsFrom(expression) {
  const matches = [...expression.matchAll(/"((?:\\.|[^"\\])*)"/g)];
  return matches.map((m) => javaString(m[1])).join('');
}
function stripCasts(expression) { let value = expression.trim(); while (/^\(\s*[A-Za-z_$][\w.$<>?, ]*\s*\)\s*/.test(value)) value = value.replace(/^\(\s*[A-Za-z_$][\w.$<>?, ]*\s*\)\s*/, ''); return value.trim(); }
function quotedArgument(expression) { const m = expression.match(/^\s*"((?:\\.|[^"\\])*)"\s*$/); return m && javaString(m[1]); }

export function extractSql(source = '') {
  const prepared = source.match(/prepareStatement\s*\(\s*([A-Za-z_$][\w$]*|"(?:\\.|[^"\\])*")\s*\)/s);
  if (prepared) {
    const argument = prepared[1];
    if (argument.startsWith('"')) return stringsFrom(argument);
    const assignment = new RegExp(`(?:String\\s+)?${argument.replace(/[$]/g, '\\$&')}\\s*=\\s*([\\s\\S]*?);`).exec(source);
    if (assignment) return stringsFrom(assignment[1]);
  }
  const candidates = [...source.matchAll(/(?:String\s+)?[A-Za-z_$][\w$]*\s*=\s*([\s\S]*?);/g)];
  for (const candidate of candidates) { const value = stringsFrom(candidate[1]); if (/\b(select|insert|update|delete|with)\b/i.test(value)) return value; }
  return '';
}

function resolve(expression, type, map) {
  const original = expression.trim(); const value = stripCasts(original);
  if (type === 'Null' || value === 'null') return { resolved:true, sqlValue:'NULL' };
  const date = value.match(/^(Date|Timestamp|Time)\.valueOf\s*\(\s*"((?:\\.|[^"\\])*)"\s*\)$/);
  if (date) { const literal = javaString(date[2]); return { resolved:true, sqlValue: date[1] === 'Date' ? `DATE '${literal}'` : date[1] === 'Timestamp' ? `TIMESTAMP '${literal}'` : `TIME '${literal}'` }; }
  const string = quotedArgument(value);
  if (string !== null && string !== false) return { resolved:true, sqlValue:`'${string.replace(/'/g, "''")}'` };
  if (/^(true|false)$/i.test(value)) return { resolved:true, sqlValue:value.toUpperCase() };
  if (/^[+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?[fFdDlL]?$/.test(value)) return { resolved:true, sqlValue:value.replace(/[fFdDlL]$/, '') };
  const key = value.match(/\.get\s*\(\s*"((?:\\.|[^"\\])*)"\s*\)/);
  if (key && map.has(javaString(key[1]))) { const mapValue = map.get(javaString(key[1])); return type === 'String' || type === 'BigDecimal' ? { resolved:true, sqlValue: type === 'BigDecimal' && /^[+-]?\d/.test(mapValue) ? mapValue : `'${mapValue.replace(/'/g, "''")}'` } : { resolved:true, sqlValue:mapValue }; }
  return { resolved:false, sqlValue:'/* UNRESOLVED */ ?' };
}

export function parseBindings(source = '', map = new Map()) {
  const found = []; const regex = /\.[ \t\r\n]*set([A-Za-z]+)\s*\(\s*(\d+)\s*,\s*([\s\S]*?)\s*\)\s*;/g;
  for (const match of source.matchAll(regex)) { const type = match[1]; if (!setters.has(type)) continue; const resolved = resolve(match[3], type, map); found.push({ index:Number(match[2]), type:`set${type}`, expression:match[3].trim(), ...resolved }); }
  return found.sort((a,b) => a.index - b.index);
}

export function reconstruct(source, map) {
  const sql = extractSql(source); const bindings = parseBindings(source, map);
  const warnings = bindings.filter((b) => !b.resolved).map((b) => `#${b.index}: ${b.expression}`);
  if (!sql) warnings.unshift('Could not find SQL passed to prepareStatement().');
  return { sql: formatSql(substituteParameters(sql, bindings)), bindings, warnings };
}
