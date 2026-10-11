// Ejecutar: node tests/core.test.js
const assert = require('assert');
const core = require('../js/core.js');

let n = 0;
for (const nivel of core.TABLERO) {
  const r = core.simular(nivel, nivel.sol);
  assert.ok(r.ok, `La solución de ${nivel.id} debe ganar (choco=${r.choco}, llego=${r.llego}, faltan=${r.faltan})`);
  assert.strictEqual(core.estrellasGanadas(nivel, nivel.sol), 3, `${nivel.id}: la solución de referencia da 3 estrellas`);
  if (nivel.maxBlocks) assert.ok(nivel.sol.length <= nivel.maxBlocks, `${nivel.id}: respeta maxBlocks`);
  assert.ok(nivel.sol.every((b) => nivel.allowed.includes(b.c)), `${nivel.id}: solo usa bloques permitidos`);
  assert.ok(nivel.rep || nivel.sol.every((b) => b.n === 1), `${nivel.id}: sin repetir cuando no se permite`);
  n++;
}

// Choque contra la pared y contra el borde
const t7 = core.TABLERO.find((t) => t.id === 't7');
assert.ok(core.simular(t7, [{ c: 'F', n: 1 }]).choco, 'chocar con la roca');
assert.ok(core.simular(core.TABLERO[0], [{ c: 'L', n: 1 }, { c: 'F', n: 1 }]).choco, 'chocar con el borde');
// Llegar sin recoger todas las estrellas no gana
const t10 = core.TABLERO.find((t) => t.id === 't10');
const r = core.simular(t10, [{ c: 'R', n: 1 }, { c: 'F', n: 4 }, { c: 'L', n: 1 }, { c: 'F', n: 4 }]);
assert.ok(r.llego && r.faltan > 0 && !r.ok, 'sin todas las estrellas no es victoria');

// Todos los ids únicos
const ids = core.NIVELES.map((x) => x.id);
assert.strictEqual(new Set(ids).size, ids.length, 'ids únicos');

// Frases de voz: ids únicos, sin {n} en la versión grabable y todo texto hablado cubierto
const frases = core.todasLasFrases();
assert.strictEqual(new Set(frases.map((f) => f.id)).size, frases.length, 'ids de frases únicos');
assert.ok(frases.every((f) => !f.texto.includes('{n}') && /^[a-z0-9-]+$/.test(f.id)), 'frases sin {n} e ids válidos');
const cubiertas = new Set(frases.map((f) => f.id));
const habladas = [].concat(core.TABLERO.flatMap((t) => [t.voz, t.pista]), core.ORDEN.flatMap((o) => [o.voz, o.cierre]), core.MSG.alabanzas, Object.values(core.MSG.repetir));
habladas.forEach((t) => assert.ok(cubiertas.has(core.idFrase(core.generica(t))), 'sin audio previsto: ' + t));
assert.strictEqual(core.generica('¡Hola, {n}! Soy Beto'), '¡Hola! Soy Beto');

console.log(`OK: ${n} niveles de tablero verificados, ${ids.length} niveles en total.`);
