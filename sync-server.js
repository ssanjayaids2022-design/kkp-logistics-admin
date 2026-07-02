// ─── KKP Shared-State Sync Server ────────────────────────────────────────────
// A minimal HTTP server that holds shared app state in memory so all browsers
// (Edge, Chrome, Firefox, etc.) see the same data in real time. This is what
// makes agent 1's changes (loads, drivers, assignments) show up for agent 2.
// Run alongside Vite: `node sync-server.js`  (or `npm run dev:sync`).
//
// Endpoints:
//   GET  /api/locks          → { driverId: DriverLock, … }
//   POST /api/locks/:id      → lock a driver  (body: DriverLock JSON)
//   DELETE /api/locks/:id    → unlock a driver
//   GET  /api/data/:key      → { value: <doc|null> }   shared documents
//   PUT  /api/data/:key      → store a document  (body: { value })
//   GET  /api/health         → { ok: true }

import http from 'http';

const PORT = 3001;
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
};

// In-memory lock store  { [driverId]: DriverLock }
const locks = {};

// In-memory document store  { [key]: any }  — holds loads, drivers, etc.
const docs = {};

function send(res, status, body) {
  res.writeHead(status, CORS_HEADERS);
  res.end(JSON.stringify(body));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', chunk => (data += chunk));
    req.on('end', () => {
      try { resolve(JSON.parse(data || '{}')); }
      catch { reject(new Error('Invalid JSON')); }
    });
    req.on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  const { method, url } = req;

  // Pre-flight CORS
  if (method === 'OPTIONS') return send(res, 204, {});

  // GET /api/health
  if (method === 'GET' && url === '/api/health') {
    return send(res, 200, { ok: true });
  }

  // GET /api/locks
  if (method === 'GET' && url === '/api/locks') {
    return send(res, 200, locks);
  }

  // POST /api/locks/:driverId
  const postMatch = url.match(/^\/api\/locks\/([^/]+)$/);
  if (method === 'POST' && postMatch) {
    try {
      const lock = await readBody(req);
      locks[postMatch[1]] = lock;
      console.log(`[LOCK]   ${postMatch[1]} → ${lock.agentName}`);
      return send(res, 200, { ok: true });
    } catch {
      return send(res, 400, { error: 'Bad request' });
    }
  }

  // DELETE /api/locks/:driverId
  const delMatch = url.match(/^\/api\/locks\/([^/]+)$/);
  if (method === 'DELETE' && delMatch) {
    delete locks[delMatch[1]];
    console.log(`[UNLOCK] ${delMatch[1]}`);
    return send(res, 200, { ok: true });
  }

  // GET /api/data/:key  → { value: <doc|null> }
  const dataGet = url.match(/^\/api\/data\/([^/]+)$/);
  if (method === 'GET' && dataGet) {
    const key = dataGet[1];
    return send(res, 200, { value: key in docs ? docs[key] : null });
  }

  // PUT /api/data/:key   body: { value }
  const dataPut = url.match(/^\/api\/data\/([^/]+)$/);
  if (method === 'PUT' && dataPut) {
    try {
      const body = await readBody(req);
      const key = dataPut[1];
      docs[key] = body.value;
      const count = Array.isArray(body.value) ? `${body.value.length} items` : 'ok';
      console.log(`[DATA]   ${key} ← ${count}`);
      return send(res, 200, { ok: true });
    } catch {
      return send(res, 400, { error: 'Bad request' });
    }
  }

  send(res, 404, { error: 'Not found' });
});

server.listen(PORT, () => {
  console.log(`\n✅  KKP Sync Server running at http://localhost:${PORT}`);
  console.log('   Loads, drivers & locks are now shared across ALL browsers.\n');
});
