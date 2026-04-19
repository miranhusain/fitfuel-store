import Datastore from '@seald-io/nedb';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const DATA_DIR = path.resolve(__dirname, '../../../data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

console.log('[DB] Data directory:', DATA_DIR);

export const products  = new Datastore({ filename: path.join(DATA_DIR, 'products.db'),  autoload: true });
export const analytics = new Datastore({ filename: path.join(DATA_DIR, 'analytics.db'), autoload: true });
export const settings  = new Datastore({ filename: path.join(DATA_DIR, 'settings.db'),  autoload: true });
export const logs      = new Datastore({ filename: path.join(DATA_DIR, 'logs.db'),       autoload: true });

// Indexes
products.ensureIndex({ fieldName: 'category' });
products.ensureIndex({ fieldName: 'brand' });
analytics.ensureIndex({ fieldName: 'type' });

// Default settings (insert only if missing)
async function initSettings() {
  const defaults = [
    { key: 'whatsapp_number',    value: '9647701180781' },
    { key: 'store_name_en',      value: 'FitFuel Store' },
    { key: 'store_name_ar',      value: 'متجر فيت فيول' },
    { key: 'admin_password',     value: 'admin123' },
    { key: 'visitor_multiplier', value: '10' },
  ];
  for (const d of defaults) {
    const exists = await settings.findOneAsync({ key: d.key });
    if (!exists) await settings.insertAsync(d);
  }
  console.log('[DB] Settings initialized ✅');
}

initSettings();

export async function getSetting(key) {
  const row = await settings.findOneAsync({ key });
  return row?.value ?? null;
}

export async function setSetting(key, value) {
  await settings.updateAsync({ key }, { $set: { value } }, { upsert: true });
}

console.log('[DB] NeDB datastores loaded ✅');
