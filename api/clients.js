// Vercel Function: /api/clients
// Needs two environment variables in Vercel:
//   DATABASE_URL  – added automatically when you connect Neon Postgres from Vercel > Storage
//   APP_PASSCODE  – the passcode your brother types to open the client list
import { neon } from '@neondatabase/serverless';
import { handle } from '../lib/clients.js';

const dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;
const sql = dbUrl ? neon(dbUrl) : null;
const query = sql ? (text, params) => sql.query(text, params) : null;

export default {
  fetch(request) {
    return handle(request, process.env, query);
  },
};
