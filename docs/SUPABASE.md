# Supabase integration

This project supports using Supabase as the persistent backend for the application state. By default the app uses IndexedDB (local browser storage). To enable Supabase:

1. Create a Supabase project: https://app.supabase.com/
2. Create a table named `app_state` with columns:
   - `id` TEXT PRIMARY KEY
   - `state` JSONB
   - `updated_at` TIMESTAMP
3. Add the following environment variables (see `.env.example`):
   - `VITE_USE_SUPABASE=true`
   - `VITE_SUPABASE_URL` (from Supabase project settings)
   - `VITE_SUPABASE_ANON_KEY` (public anon key)

After that, the app will use Supabase for `saveToDB`, `loadFromDB`, `importDatabase`, and `exportDatabase` automatically when `VITE_USE_SUPABASE` is `true`.

Note: Do not commit secret keys to source control; use environment variables or a secrets manager.

---

## One-click schema setup ✅

You can apply the required Postgres schema automatically with the bundled script. The script requires direct DB access via a Postgres connection string (this is available in Supabase Project → Settings → Database → Connection string).

Steps:

1. Add the DB connection string to your environment (DO NOT commit it):

```
# Example (add to .env.local or export in shell)
SUPABASE_DB_URL=postgresql://postgres:<PASSWORD>@db.<region>.supabase.co:5432/postgres
```

2. Run the setup script:

```
npm run setup:supabase
```

This runs `sql/supabase_init.sql` against the DB and will create the `app_state` table (and an index) if it does not already exist.

If you prefer to run manually, open `sql/supabase_init.sql` and paste it into the Supabase SQL editor (Project → SQL) and run.

### Recommended extensions & RLS (added to `sql/supabase_init.sql`)
- `pgcrypto` — useful helpers like `gen_random_uuid()`
- `citext` — case-insensitive text

A permissive RLS policy is included for development. **Tighten policies for production** (e.g. check auth claims or restrict to server writes).

**Verification script**: You can check the table and row counts with:

```
SUPABASE_DB_URL="postgresql://..." node scripts/check-supabase.js
```

**Security note:** `SUPABASE_DB_URL` contains credentials — use a secure `.env.local` and do not commit it to git.

