import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

export function loadEnv() {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const envPath = path.join(__dirname, '..', '.env');
  console.log(`ℹTrying to load env from: ${envPath}`);

  let buf;
  try {
    buf = fs.readFileSync(envPath);
  } catch {
    console.error('backend/.env not found at the path above.');
    return;
  }

  const hasNulls = buf.some((b, i) => i % 2 === 1 && b === 0x00);
  const startsWithUTF8BOM = buf.length >= 3 && buf[0] === 0xEF && buf[1] === 0xBB && buf[2] === 0xBF;
  const startsWithUTF16LEBOM = buf.length >= 2 && buf[0] === 0xFF && buf[1] === 0xFE;

  let encoding = 'utf8';
  if (startsWithUTF16LEBOM || hasNulls) encoding = 'utf16le';

  let raw = buf.toString(encoding);
  if (startsWithUTF8BOM) raw = raw.slice(1);

  const parsed = {};
  for (let line of raw.split(/\r?\n/)) {
    if (!line) continue;
    line = line.trim();
    if (!line || line.startsWith('#') || line.startsWith('//')) continue;
    if (line.startsWith('export ')) line = line.slice(7).trim();
    const eq = line.indexOf('=');
    if (eq <= 0) continue;
    const key = line.slice(0, eq).trim();
    let val = line.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (key) parsed[key] = val;
  }

  const keys = Object.keys(parsed);
  for (const k of keys) {
    if (process.env[k] === undefined) process.env[k] = parsed[k];
  }
  console.log(`Loaded ${keys.length} env var(s): ${keys.join(', ') || '(none)'}`);
}
