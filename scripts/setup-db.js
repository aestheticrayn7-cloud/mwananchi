import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function executeSql(filePath) {
  try {
    const sql = fs.readFileSync(filePath, 'utf-8');
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    for (const statement of statements) {
      console.log(`[v0] Executing: ${statement.substring(0, 80)}...`);
      const { error } = await supabase.rpc('exec_sql', { sql: statement });
      if (error) {
        console.error(`[v0] Error: ${error.message}`);
      } else {
        console.log(`[v0] Success`);
      }
    }
  } catch (err) {
    console.error(`[v0] Failed to read/execute ${filePath}:`, err.message);
  }
}

async function setupDatabase() {
  console.log('[v0] Starting database setup...');

  const scriptDir = path.dirname(new URL(import.meta.url).pathname);
  const scripts = [
    path.join(scriptDir, '01-schema.sql'),
    path.join(scriptDir, '02-indexes.sql'),
    path.join(scriptDir, '03-triggers.sql'),
    path.join(scriptDir, '04-rls.sql'),
  ];

  for (const script of scripts) {
    console.log(`[v0] Executing ${path.basename(script)}...`);
    await executeSql(script);
  }

  console.log('[v0] Database setup complete!');
}

setupDatabase().catch(err => {
  console.error('[v0] Setup failed:', err);
  process.exit(1);
});
