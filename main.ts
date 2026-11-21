// Main compilation and dossier generation script for GTA VI Trophy Guide 100% Hub
import { cpSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const baseDir = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(outputDir, { recursive: true });
cpSync(join(baseDir, 'app'), join(outputDir, 'app'), { recursive: true });
mkdirSync(join(outputDir, 'screenshots'), { recursive: true });
if (existsSync(join(baseDir, 'screenshots'))) {
  cpSync(join(baseDir, 'screenshots'), join(outputDir, 'screenshots'), { recursive: true });
}
if (existsSync(join(baseDir, 'shots.json'))) {
  cpSync(join(baseDir, 'shots.json'), join(outputDir, 'shots.json'));
}
const shotsJsonPath = join(outputDir, 'shots.json');
if (existsSync(shotsJsonPath)) {
  const shots = JSON.parse(readFileSync(shotsJsonPath, 'utf8'));
  for (const shot of shots) {
    const shotPath = join(outputDir, 'screenshots', shot.file);
    if (!existsSync(shotPath)) {
      throw new Error(`Build failed: missing screenshot file '${shot.file}' under out/screenshots (referenced in out/shots.json)`);
    }
  }
}

writeFileSync(
  join(outputDir, 'dossier.json'),
  buildDossier(outputDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
  })
);

console.log(`Successfully built output at ${outputDir} and generated dossier.json.`);
