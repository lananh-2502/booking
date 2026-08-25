import { readFile, writeFile } from 'node:fs/promises';

const databaseId = process.env.CLOUDFLARE_D1_DATABASE_ID;
if (!databaseId) throw new Error('Missing CLOUDFLARE_D1_DATABASE_ID. Add it as a GitHub Actions secret.');

const workerName = process.env.CLOUDFLARE_WORKER_NAME || 'hen-nha';
const databaseName = process.env.CLOUDFLARE_D1_DATABASE_NAME || 'hen-nha-db';
const generated = JSON.parse(await readFile('dist/server/wrangler.json', 'utf8'));

const config = {
  $schema: './node_modules/wrangler/config-schema.json',
  ...generated,
  name: workerName,
  main: './index.js',
  compatibility_date: '2026-08-25',
  compatibility_flags: ['nodejs_compat'],
  assets: {
    directory: '../client',
  },
  d1_databases: [{
    binding: 'DB',
    database_name: databaseName,
    database_id: databaseId,
    migrations_dir: '../../drizzle',
  }],
  observability: { enabled: true },
};

delete config.topLevelName;
delete config.dev;
delete config.build;
await writeFile('dist/server/wrangler.deploy.jsonc', `${JSON.stringify(config, null, 2)}\n`);
console.log(`Prepared Cloudflare Worker ${workerName} with D1 binding DB.`);
