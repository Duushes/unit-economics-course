// Генерирует банк заданий тренажёра в public/trainer/*.json.
import { generateCalcTasks, generateTinderCards } from './task-lib.mjs';
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const dir = join(import.meta.dirname, '..', 'public', 'trainer');
mkdirSync(dir, { recursive: true });

const calc = generateCalcTasks(1000);
// Тиндер — весь банк уникальных определений (см. Tinder_Definitions_PROMPT.md).
const tinder = generateTinderCards();

writeFileSync(join(dir, 'calc.json'), JSON.stringify(calc));
writeFileSync(join(dir, 'tinder.json'), JSON.stringify(tinder));

console.log(`generated ${calc.length} calc + ${tinder.length} tinder tasks`);
