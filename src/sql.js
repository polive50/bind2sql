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
      result += binding ? binding.sqlValue : `/* UNRESOLVED #${position}: no binding */ ?`;
    } else result += char;
  }
  return result;
}

export function formatSql(sql) {
  return sql.replace(/\s+/g, ' ').trim()
    .replace(/\s+(FROM|INNER JOIN|LEFT JOIN|RIGHT JOIN|WHERE|GROUP BY|ORDER BY|HAVING|LIMIT)\s+/gi, '\n$1 ')
    .replace(/\s+(AND|OR)\s+/gi, '\n  $1 ')
    .replace(/\s+(ON)\s+/gi, '\n    $1 ');
}
