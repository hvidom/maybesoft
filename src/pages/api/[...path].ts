import { Hono } from 'hono';
import type { APIRoute } from 'astro';
import { getAuth } from '../../lib/auth';
import { getDb } from '../../db/db';
import * as schema from '../../db/schema';
import { eq } from 'drizzle-orm';
import { env as cfEnv } from 'cloudflare:workers';

export const prerender = false;

const app = new Hono();

// Catch-all Better Auth handler
app.all('/api/auth/*', async (c) => {
  const auth = getAuth(c.env);
  return auth.handler(c.req.raw);
});

// Middleware to verify session and inject user/session into context
const authMiddleware = async (c: any, next: () => Promise<void>) => {
  const auth = getAuth(c.env);
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  });

  if (!session) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  c.set('user', session.user);
  c.set('session', session.session);
  await next();
};

// --- BUSINESS API ENDPOINTS ---

// Leads Endpoint
app.get('/api/leads', authMiddleware, async (c) => {
  const db = getDb(c.env);
  const user = c.get('user');

  try {
    const data = await db.select().from(schema.leads).where(eq(schema.leads.userId, user.id));
    return c.json({ success: true, data });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

app.post('/api/leads', authMiddleware, async (c) => {
  const db = getDb(c.env);
  const user = c.get('user');
  const body = await c.req.json();

  try {
    const id = crypto.randomUUID();
    const newLead = {
      id,
      userId: user.id,
      phone: body.phone || '',
      company: body.company || '',
      status: body.status || 'new',
      notes: body.notes || '',
      createdAt: new Date(),
    };
    await db.insert(schema.leads).values(newLead);
    return c.json({ success: true, data: newLead });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

// Contacts Endpoint
app.get('/api/contacts', authMiddleware, async (c) => {
  const db = getDb(c.env);
  const user = c.get('user');

  try {
    const data = await db.select().from(schema.contacts).where(eq(schema.contacts.userId, user.id));
    return c.json({ success: true, data });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

app.post('/api/contacts', authMiddleware, async (c) => {
  const db = getDb(c.env);
  const user = c.get('user');
  const body = await c.req.json();

  try {
    const id = crypto.randomUUID();
    const newContact = {
      id,
      userId: user.id,
      phone: body.phone || '',
      subject: body.subject || 'General Inquiry',
      message: body.message || '',
      status: body.status || 'pending',
      createdAt: new Date(),
    };
    await db.insert(schema.contacts).values(newContact);
    return c.json({ success: true, data: newContact });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

// Clients Endpoint
app.get('/api/clients', authMiddleware, async (c) => {
  const db = getDb(c.env);
  const user = c.get('user');

  try {
    const data = await db.select().from(schema.clients).where(eq(schema.clients.userId, user.id));
    return c.json({ success: true, data });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

app.post('/api/clients', authMiddleware, async (c) => {
  const db = getDb(c.env);
  const user = c.get('user');
  const body = await c.req.json();

  try {
    const id = crypto.randomUUID();
    const newClient = {
      id,
      userId: user.id,
      companyName: body.companyName || '',
      website: body.website || '',
      tier: body.tier || 'free',
      billingStatus: body.billingStatus || 'trial',
      createdAt: new Date(),
    };
    await db.insert(schema.clients).values(newClient);
    return c.json({ success: true, data: newClient });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});


// Exporting Astro APIRoute handler for Astro v6
export const ALL: APIRoute = async (context) => {
  return app.fetch(context.request, cfEnv);
};
