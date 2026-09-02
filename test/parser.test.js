import test from 'node:test';
import assert from 'node:assert/strict';
import { parseMap } from '../src/map-parser.js';
import { reconstruct } from '../src/java-parser.js';

const run = (code, map = '') => reconstruct(code, parseMap(map));
test('reconstructs setString and escapes apostrophes', () => { const r = run('String q = "SELECT * FROM users WHERE name = ?"; x.prepareStatement(q); pst.setString(1, "O\\\'Brien");'); assert.match(r.sql, /'O''Brien'/); });
test('reconstructs numeric setInt', () => assert.match(run('String q="SELECT * FROM t WHERE id=?"; c.prepareStatement(q); p.setInt(1, 42);').sql, /id=42/));
test('handles multiple parameters by index', () => assert.match(run('String q="SELECT * FROM t WHERE a=? AND b=?"; c.prepareStatement(q); p.setString(2,"b"); p.setInt(1, 1);').sql, /a=1\n  AND b='b'/));
test('formats Date.valueOf', () => assert.match(run('String q="SELECT * FROM t WHERE d=?"; c.prepareStatement(q); p.setDate(1, Date.valueOf("2026-09-02"));').sql, /DATE '2026-09-02'/));
test('formats Timestamp.valueOf', () => assert.match(run('String q="SELECT * FROM t WHERE d=?"; c.prepareStatement(q); p.setTimestamp(1, Timestamp.valueOf("2026-09-02 12:30:00"));').sql, /TIMESTAMP '2026-09-02 12:30:00'/));
test('formats setNull', () => assert.match(run('String q="SELECT * FROM t WHERE x=?"; c.prepareStatement(q); p.setNull(1, Types.VARCHAR);').sql, /x=NULL/));
test('resolves map get independently of map variable', () => assert.match(run('String q="SELECT * FROM t WHERE x=?"; c.prepareStatement(q); p.setString(1, resultados.get("KEY"));', '{KEY=hello}').sql, /'hello'/));
test('marks unresolvable binding', () => { const r = run('String q="SELECT * FROM t WHERE x=?"; c.prepareStatement(q); p.setString(1, unknown());'); assert.equal(r.warnings.length, 1); assert.match(r.sql, /UNRESOLVED/); });
test('does not replace question marks inside SQL string literals', () => assert.match(run('String q="SELECT \'?\' AS marker WHERE id=?"; c.prepareStatement(q); p.setInt(1, 7);').sql, /'\?' AS marker\s+WHERE id=7/));
test('realistic concatenated PreparedStatement example', () => { const r = run('String query = "SELECT * FROM users WHERE id = ? " + "AND enabled = ? AND created = ?"; PreparedStatement p = con.prepareStatement(query); p.setString(1, data.get("ID")); p.setBoolean(2, true); p.setDate(3, Date.valueOf("2026-09-02"));', '{ID=12648350}'); assert.match(r.sql, /id = '12648350'/); assert.match(r.sql, /enabled = TRUE/); assert.equal(r.warnings.length, 0); });
