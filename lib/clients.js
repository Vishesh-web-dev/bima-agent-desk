// Client list API logic. Kept free of Vercel and driver specifics so it can be
// tested with any `query(text, params) -> rows` function.
import { createHash, randomUUID, timingSafeEqual } from 'node:crypto';

export const TYPES = ['Car', 'Two-wheeler', 'Commercial vehicle', 'Health', 'Shop / business', 'Home', 'Travel', 'Personal accident', 'Other'];
export const STAGES = ['Lead', 'Quote sent', 'Customer', 'Lost'];

const MAX_BODY = 20_000;
const MAX_ROWS = 5_000;
const ID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

const COLS = `id, name, phone, type, detail,
  to_char(expiry, 'YYYY-MM-DD') AS expiry,
  premium::float8 AS premium, stage, source, notes,
  created_at AS "createdAt", updated_at AS "updatedAt", renewed_at AS "renewedAt"`;

const CREATE_TABLE = `CREATE TABLE IF NOT EXISTS clients (
  id          text PRIMARY KEY,
  name        text NOT NULL,
  phone       text NOT NULL DEFAULT '',
  type        text NOT NULL DEFAULT 'Other',
  detail      text NOT NULL DEFAULT '',
  expiry      date,
  premium     numeric(12,2),
  stage       text NOT NULL DEFAULT 'Lead',
  source      text NOT NULL DEFAULT '',
  notes       text NOT NULL DEFAULT '',
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  renewed_at  timestamptz
)`;

class BadRequest extends Error {}

function json(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });
}

function sameSecret(a, b) {
  const ha = createHash('sha256').update(String(a)).digest();
  const hb = createHash('sha256').update(String(b)).digest();
  return timingSafeEqual(ha, hb);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function validDate(s) {
  if (typeof s !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const [y, m, d] = s.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return y >= 1990 && y <= 2100 && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d;
}

export function clean(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new BadRequest('Send the client as a JSON object.');
  const str = (v, max) => (v == null ? '' : String(v)).trim().slice(0, max);
  const name = str(input.name, 120);
  if (!name) throw new BadRequest('Name is required.');
  let premium = input.premium === '' || input.premium == null ? null : Number(input.premium);
  if (premium != null && (!Number.isFinite(premium) || premium < 0 || premium > 1e9)) premium = null;
  return {
    name,
    phone: str(input.phone, 20),
    type: TYPES.includes(input.type) ? input.type : 'Other',
    detail: str(input.detail, 200),
    expiry: validDate(input.expiry) ? input.expiry : null,
    premium,
    stage: STAGES.includes(input.stage) ? input.stage : 'Lead',
    source: str(input.source, 40),
    notes: str(input.notes, 2000),
    renewed: input.renewed === true,
  };
}

async function readJson(request) {
  const text = await request.text();
  if (text.length > MAX_BODY) throw new BadRequest('That entry is too long.');
  try {
    return JSON.parse(text || 'null');
  } catch {
    throw new BadRequest('The request body is not valid JSON.');
  }
}

let tableReady = null;
function ensureTable(query) {
  if (!tableReady) tableReady = query(CREATE_TABLE, []).catch((e) => { tableReady = null; throw e; });
  return tableReady;
}

/**
 * @param {Request} request
 * @param {{APP_PASSCODE?: string}} env
 * @param {null | ((text: string, params: unknown[]) => Promise<any[]>)} query
 */
export async function handle(request, env, query) {
  if (!query) {
    return json(503, { error: 'no_database', message: 'No database is connected. In Vercel, open Storage, add Neon Postgres to this project, then redeploy.' });
  }
  if (!env.APP_PASSCODE) {
    return json(503, { error: 'no_passcode', message: 'The passcode is not set. In Vercel, add APP_PASSCODE under Settings > Environment Variables, then redeploy.' });
  }
  const auth = request.headers.get('authorization') || '';
  const given = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (!given || !sameSecret(given, env.APP_PASSCODE)) {
    await sleep(500);
    return json(401, { error: 'bad_passcode', message: 'Wrong passcode.' });
  }

  const url = new URL(request.url);
  const id = url.searchParams.get('id');

  try {
    await ensureTable(query);

    if (request.method === 'GET') {
      const rows = await query(`SELECT ${COLS} FROM clients ORDER BY expiry NULLS LAST, name LIMIT ${MAX_ROWS}`, []);
      return json(200, { clients: rows });
    }

    if (request.method === 'POST') {
      const c = clean(await readJson(request));
      const [{ n }] = await query('SELECT count(*)::int AS n FROM clients', []);
      if (n >= MAX_ROWS) return json(409, { error: 'full', message: `The list is full (${MAX_ROWS} clients). Delete old or lost entries first.` });
      const rows = await query(
        `INSERT INTO clients (id, name, phone, type, detail, expiry, premium, stage, source, notes)
         VALUES ($1, $2, $3, $4, $5, $6::date, $7::numeric, $8, $9, $10)
         RETURNING ${COLS}`,
        [randomUUID(), c.name, c.phone, c.type, c.detail, c.expiry, c.premium, c.stage, c.source, c.notes],
      );
      return json(201, { client: rows[0] });
    }

    if (request.method === 'PUT' || request.method === 'DELETE') {
      if (!id || !ID_RE.test(id)) return json(400, { error: 'bad_id', message: 'Missing or invalid client id.' });

      if (request.method === 'DELETE') {
        const rows = await query('DELETE FROM clients WHERE id = $1 RETURNING id', [id]);
        if (!rows.length) return json(404, { error: 'not_found', message: 'That client was already deleted.' });
        return json(200, { deleted: id });
      }

      const c = clean(await readJson(request));
      const rows = await query(
        `UPDATE clients SET name = $2, phone = $3, type = $4, detail = $5, expiry = $6::date,
           premium = $7::numeric, stage = $8, source = $9, notes = $10, updated_at = now(),
           renewed_at = CASE WHEN $11::boolean THEN now() ELSE renewed_at END
         WHERE id = $1
         RETURNING ${COLS}`,
        [id, c.name, c.phone, c.type, c.detail, c.expiry, c.premium, c.stage, c.source, c.notes, c.renewed],
      );
      if (!rows.length) return json(404, { error: 'not_found', message: 'That client no longer exists. Reload the list.' });
      return json(200, { client: rows[0] });
    }

    return json(405, { error: 'method', message: 'Method not allowed.' });
  } catch (e) {
    if (e instanceof BadRequest) return json(400, { error: 'bad_request', message: e.message });
    console.error('clients api error', e);
    return json(500, { error: 'server', message: 'Something went wrong on the server. Try again in a moment.' });
  }
}
