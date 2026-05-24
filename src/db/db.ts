import { drizzle as drizzleD1 } from 'drizzle-orm/d1';
import { drizzle as drizzleLibsql } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from './schema';

let localDbInstance: any = null;

export function getDb(env?: any) {
  // If D1 binding is present (Cloudflare Worker runtime)
  if (env?.DB) {
    return drizzleD1(env.DB, { schema });
  }
  
  // If global process env has DB (fallback)
  if (typeof globalThis !== 'undefined' && (globalThis as any).process?.env?.DB) {
    return drizzleD1((globalThis as any).process.env.DB, { schema });
  }

  // Local development / CLI fallback using pure-JS LibSQL (fully compatible with Node.js and Bun)
  if (!localDbInstance) {
    const client = createClient({ url: 'file:local.db' });
    localDbInstance = drizzleLibsql(client, { schema });
  }
  
  return localDbInstance;
}
