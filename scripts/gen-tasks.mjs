// Генерирует банк заданий тренажёра в public/trainer/*.json.
import { generateCalcTasks, generateTinderCards } from './task-lib.mjs';
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const dir = join(import.meta.dirname, '..', 'public', 'trainer');
mkdirSync(dir, { recursive: true });

const calc = generateCalcTasks(1000);
const tinder = generateTinderCards(1000);

writeFileSync(join(dir, 'calc.json'), JSON.stringify(calc));
writeFileSync(join(dir, 'tinder.json'), JSON.stringify(tinder));

console.log(`generated ${calc.length} calc + ${tinder.length} tinder tasks`);
