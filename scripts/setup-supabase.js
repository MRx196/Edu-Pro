#!/usr/bin/env node
/*
  One-click Supabase schema setup script (ESM).
  Usage:
    SUPABASE_DB_URL=postgresql://user:pass@host:port/db npm run setup:supabase

  The script reads `sql/supabase_init.sql` and executes it against the database URL provided via SUPABASE_DB_URL.
  Keep your DB credentials secure and do not commit them to source control.
*/

import fs from 'fs';
import path from 'path';
import { Client } from 'pg';

async function main() {
  try {
    const dbUrl = process.env.SUPABASE_DB_URL;
    if (!dbUrl) {
      console.error('ERROR: SUPABASE_DB_URL environment variable is required.');
      console.error('Example: SUPABASE_DB_URL=postgresql://postgres:password@db.host:5432/postgres npm run setup:supabase');
      process.exit(1);
    }

    const sqlPath = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', 'sql', 'supabase_init.sql');
    if (!fs.existsSync(sqlPath)) {
      console.error('ERROR: SQL file not found at', sqlPath);
      process.exit(1);
    }

    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('Connecting to database...');
    const client = new Client({ connectionString: dbUrl });
    await client.connect();

    console.log('Executing SQL schema...');
    await client.query(sql);

    console.log('Schema applied successfully.');
    await client.end();
    process.exit(0);
  } catch (err) {
    console.error('Failed to apply schema:', err.message || err);
    process.exit(2);
  }
}

main();
