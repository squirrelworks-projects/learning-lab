// Checks that every `import { a, b } from "./x.js"` points to an existing file that exports those names.
// Run from the repo root: node tools/check-imports.mjs $(git ls-files "*.js")
import fs from 'fs'; import path from 'path';
const files = process.argv.slice(2);
let bad = 0;
for (const f of files) {
  const src = fs.readFileSync(f, 'utf8');
  for (const m of src.matchAll(/import\s*\{([^}]*)\}\s*from\s*'([^']+)'/g)) {
    const target = path.resolve(path.dirname(f), m[2]);
    if (!fs.existsSync(target)) { console.log(`${f}: missing ${m[2]}`); bad++; continue; }
    const tsrc = fs.readFileSync(target, 'utf8');
    for (let name of m[1].split(',').map(s => s.trim()).filter(Boolean)) {
      name = name.split(/\s+as\s+/)[0];
      if (!new RegExp(`export\\s+(async\\s+)?(function|class|const|let)\\s+${name}\\b`).test(tsrc)) { console.log(`${f}: ${name} not exported by ${m[2]}`); bad++; }
    }
  }
}
console.log(bad ? `${bad} problems` : 'all imports ok');
