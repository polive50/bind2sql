import { parseMap } from './map-parser.js';
import { reconstruct } from './java-parser.js';

const $ = (id) => document.getElementById(id);
const example = `String sql = "SELECT * FROM imap.per_convenios_persona c "\n  + "INNER JOIN persona.tint_social s ON s.secuencial = c.n_cod_tint_social "\n  + "WHERE s.tidpe_per_codigo = ? AND s.tidpe_tiper_codigo = ? "\n  + "AND s.tidpe_falta = ? AND s.PYCAR_CODIGO = ?";\nPreparedStatement pst = con.prepareStatement(sql);\npst.setString(1, (String) datos.get("PER_CODIGO"));\npst.setString(2, (String) datos.get("TIPER_CODIGO"));\npst.setDate(3, Date.valueOf("2026-09-02"));\npst.setString(4, "23");`;

function renderList(element, items, emptyText, warning = false) {
  element.replaceChildren();
  for (const item of items.length ? items : [emptyText]) {
    const li = document.createElement('li');
    if (warning && items.length) li.classList.add('warning');
    li.textContent = item;
    element.append(li);
  }
}

function render() {
  const output = reconstruct($('javaCode').value, parseMap($('mapData').value));
  $('sqlOutput').textContent = output.sql || 'No SQL found.';
  renderList($('bindings'), output.bindings.map((b) => `#${b.index} ${b.type}: ${b.expression} -> ${b.sqlValue}`), 'None detected.');
  renderList($('warnings'), output.warnings, 'None.', true);
}

$('rebuild').onclick = render;
$('example').onclick = () => { $('javaCode').value = example; $('mapData').value = '{PER_CODIGO=12648350, TIPER_CODIGO=29, PYCAR_CODIGO=23}'; render(); };
$('clear').onclick = () => { $('javaCode').value = ''; $('mapData').value = ''; $('sqlOutput').textContent = 'Paste Java code, then choose Rebuild SQL.'; renderList($('bindings'), [], 'None detected.'); renderList($('warnings'), [], 'None.', true); };
$('copy').onclick = async () => { await navigator.clipboard.writeText($('sqlOutput').textContent); $('copy').textContent = 'Copied'; setTimeout(() => $('copy').textContent = 'Copy SQL', 1200); };
