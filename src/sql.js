export function substituteParameters(sql, bindings) {
  let position = 0, quote = null, result = '';
  for (let i = 0; i < sql.length; i++) {
    const char = sql[i];
    if (quote) {
      result += char;
      if (char === quote) { if (sql[i + 1] === quote) result += sql[++i]; else quote = null; }
      continue;
    }
    if (char === "'" || char === '"') { quote = char; result += char; continue; }
    if (char === '?') {
      position++;
      const binding = bindings.find((item) => item.index === position);
      result += binding ? binding.sqlValue : `/* UNRESOLVED #${position} */ ?`;
    } else result += char;
  }
  return result;
}

export function formatSql(sql) {
  const formatOutsideQuotes = (text) => text.replace(/\s+/g, ' ')
    .replace(/\s+(FROM|INNER JOIN|LEFT JOIN|RIGHT JOIN|WHERE|GROUP BY|ORDER BY|HAVING|LIMIT)\s+/gi, '\n$1 ')
    .replace(/\s+(AND|OR)\s+/gi, '\n  $1 ')
    .replace(/\s+(ON)\s+/gi, '\n    $1 ');
  let quote = null, plain = '', result = '';
  const flush = () => { result += formatOutsideQuotes(plain); plain = ''; };
  for (let i = 0; i < sql.length; i++) {
    const char = sql[i];
    if (!quote) {
      if (char === "'" || char === '"' || char === '`' || char === '[') { flush(); quote = char; result += char; }
      else plain += char;
      continue;
    }
    result += char;
    const closing = quote === '[' ? ']' : quote;
    if (char === closing) { if (sql[i + 1] === closing) result += sql[++i]; else quote = null; }
  }
  flush();
  return result.trim();
}
