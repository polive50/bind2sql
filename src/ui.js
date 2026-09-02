import { parseMap } from './map-parser.js';
import { reconstruct } from './java-parser.js';
const $ = (id) => document.getElementById(id);
const example = `String sql = "SELECT * FROM imap.per_convenios_persona c "\n  + "INNER JOIN persona.tint_social s ON s.secuencial = c.n_cod_tint_social "\n  + "WHERE s.tidpe_per_codigo = ? AND s.tidpe_tiper_codigo = ? "\n  + "AND s.tidpe_falta = ? AND s.PYCAR_CODIGO = ?";\nPreparedStatement pst = con.prepareStatement(sql);\npst.setString(1, (String) datos.get("PER_CODIGO"));\npst.setString(2, (String) datos.get("TIPER_CODIGO"));\npst.setDate(3, Date.valueOf("2026-09-02"));\npst.setString(4, "23");`;
function render() { const output = reconstruct($('javaCode').value, parseMap($('mapData').value)); $('sqlOutput').textContent = output.sql || 'No SQL found.'; $('bindings').innerHTML = output.bindings.length ? output.bindings.map((b) => `<li>#${b.index} ${b.type}: ${b.expression} → ${b.sqlValue}</li>`).join('') : '<li>None detected.</li>'; $('warnings').innerHTML = output.warnings.length ? output.warnings.map((w) => `<li class="warning">${w}</li>`).join('') : '<li>None.</li>'; }
$('rebuild').onclick = render;
$('example').onclick = () => { $('javaCode').value = example; $('mapData').value = '{PER_CODIGO=12648350, TIPER_CODIGO=29, PYCAR_CODIGO=23}'; render(); };
$('clear').onclick = () => { $('javaCode').value = ''; $('mapData').value = ''; $('sqlOutput').textContent = 'Paste Java code, then choose Rebuild SQL.'; $('bindings').innerHTML = '<li>None detected.</li>'; $('warnings').innerHTML = '<li>None.</li>'; };
$('copy').onclick = async () => { await navigator.clipboard.writeText($('sqlOutput').textContent); $('copy').textContent = 'Copied'; setTimeout(() => $('copy').textContent = 'Copy SQL', 1200); };
