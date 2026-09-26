#!/usr/bin/env node
// Concatena src/*.js (en orden alfabético) dentro de src/shell.html
// y produce el único archivo autocontenido: byte_architect_quest.html
'use strict';
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const srcDir = path.join(root, 'src');
const shell = fs.readFileSync(path.join(srcDir, 'shell.html'), 'utf8');
const files = fs.readdirSync(srcDir).filter(f => f.endsWith('.js')).sort();

let js = '';
for (const f of files) {
  const code = fs.readFileSync(path.join(srcDir, f), 'utf8');
  js += `\n// ==================== ${f} ====================\n` + code + '\n';
}
if (js.includes('</script')) throw new Error('El código no puede contener la secuencia </script');

const out = shell.replace('/*__GAME__*/', () => js);
const target = path.join(root, 'byte_architect_quest.html');
fs.writeFileSync(target, out);
console.log(`OK ${target} — ${files.length} módulos, ${(out.length / 1024).toFixed(1)} KB`);
