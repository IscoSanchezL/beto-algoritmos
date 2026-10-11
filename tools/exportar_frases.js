// Genera audio/frases.json y GUION.md a partir de js/core.js.
// Ejecutar (solo si cambias textos): node tools/exportar_frases.js
const fs = require('fs');
const path = require('path');
const core = require('../js/core.js');

const frases = core.todasLasFrases();
fs.mkdirSync(path.join(__dirname, '..', 'audio'), { recursive: true });
fs.writeFileSync(path.join(__dirname, '..', 'audio', 'frases.json'), JSON.stringify(frases.map(({ id, texto }) => ({ id, texto })), null, 1) + '\n');

let md = '# Guion de voz de Beto\n\nCada frase se reproduce desde `audio/<archivo>.mp3`. Si falta el archivo, la página usa la voz del navegador.\n';
md += `Total: **${frases.length} frases**. Se generan con \`python3 tools/generar_voces.py\`.\n`;
let sec = '';
frases.forEach((f, i) => {
  if (f.sec !== sec) { sec = f.sec; md += `\n## ${sec.replace(/ · .*/, '')}\n\n| # | Frase | Archivo |\n|---|---|---|\n`; }
  md += `| ${i + 1} | ${f.texto.replace(/\|/g, '/')} | \`${f.id}.mp3\` |\n`;
});
fs.writeFileSync(path.join(__dirname, '..', 'GUION.md'), md);
console.log(`OK: ${frases.length} frases -> audio/frases.json y GUION.md`);
