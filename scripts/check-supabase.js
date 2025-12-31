#!/usr/bin/env node
/*
  Verification script: checks the `app_state` table exists and prints row count.
  Usage:
    SUPABASE_DB_URL=postgresql://... node scripts/check-supabase.js
*/

import { Client } from 'pg';

async function main() {
  const dbUrl = process.env.SUPABASE_DB_URL;
  if (!dbUrl) {
    console.error('ERROR: SUPABASE_DB_URL is required to run this script.');
    process.exit(1);
  }

  const client = new Client({ connectionString: dbUrl });
  try {
    await client.connect();
    const res = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'app_state'
      ) as exists;
    `);
    const exists = res.rows[0].exists;
    if (!exists) {
      console.log('Table `app_state` does NOT exist. Run the setup script to create it.');
      process.exit(0);
    }

    const cnt = await client.query('SELECT COUNT(*) as count FROM app_state');
    console.log('Table `app_state` exists. Row count:', cnt.rows[0].count);
    await client.end();
    process.exit(0);
  } catch (err) {
    console.error('Check failed:', err.message || err);
    process.exit(2);
  }
}

main();