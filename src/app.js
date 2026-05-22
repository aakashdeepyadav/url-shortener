const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const express = require('express');

const CODE_ALPHABET = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

function readRepoVersion() {
  const versionPath = path.resolve(__dirname, '..', 'VERSION');
  try {
    const value = fs.readFileSync(versionPath, 'utf8').trim();
    return value || '0.0.0';
  } catch {
    return '0.0.0';
  }
}

function isValidHttpUrl(value) {
  try {
    const u = new URL(value);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

function generateCode(length) {
  const bytes = crypto.randomBytes(length);
  let out = '';
  for (let i = 0; i < length; i += 1) {
    out += CODE_ALPHABET[bytes[i] % CODE_ALPHABET.length];
  }
  return out;
}

function ensureStoreFile(storePath) {
  fs.mkdirSync(path.dirname(storePath), { recursive: true });
  if (!fs.existsSync(storePath)) {
    fs.writeFileSync(storePath, JSON.stringify({ urls: {} }, null, 2), 'utf8');
  }
}

function readStore(storePath) {
  ensureStoreFile(storePath);
  const raw = fs.readFileSync(storePath, 'utf8');
  if (!raw || !raw.trim()) {
    return { urls: {} };
  }

  try {
    const data = JSON.parse(raw);
    if (!data || typeof data !== 'object' || !data.urls || typeof data.urls !== 'object') {
      return { urls: {} };
    }
    return data;
  } catch {
    return { urls: {} };
  }
}

function writeStore(storePath, store) {
  fs.writeFileSync(storePath, JSON.stringify(store, null, 2), 'utf8');
}

function nowIso() {
  const d = new Date();
  d.setMilliseconds(0);
  return d.toISOString();
}

function createApp(options = {}) {
  const appEnv = options.appEnv ?? process.env.APP_ENV ?? 'dev';
  const appVersion = options.appVersion ?? process.env.APP_VERSION ?? readRepoVersion();
  const appBuild = options.appBuild ?? process.env.APP_BUILD ?? process.env.BUILD_NUMBER ?? '';

  const storePath = options.storePath
    ?? process.env.DB_PATH
    ?? path.resolve(__dirname, '..', 'data', 'urls.json');

  const codeLength = Number(options.codeLength ?? process.env.SHORT_CODE_LENGTH ?? '6');
  if (!Number.isInteger(codeLength) || codeLength < 4 || codeLength > 16) {
    throw new Error('SHORT_CODE_LENGTH must be an integer between 4 and 16');
  }

  ensureStoreFile(storePath);

  const app = express();
  app.disable('x-powered-by');

  app.get('/', (_req, res) => {
    res.redirect(302, '/ui');
  });

  // Serve static files from 'public' directory
  app.use(express.static(path.resolve(__dirname, '..', 'public')));

  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');

    if (req.path === '/ui') {
      res.setHeader(
        'Content-Security-Policy',
        "default-src 'self'; base-uri 'none'; object-src 'none'; frame-ancestors 'none'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'"
      );
    }

    next();
  });
  app.use(express.json({ limit: '32kb' }));

  // Public health endpoint used by tests
  app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
  });

  // API health (more verbose)
  app.get('/api/health', (req, res) => {
    res.status(200).json({
      status: 'ok',
      environment: appEnv,
      version: appVersion,
      build: appBuild,
    });
  });

  app.get('/api/version', (_req, res) => {
    res.json({ version: appVersion, build: appBuild, environment: appEnv });
  });

  app.post('/api/shorten', (req, res) => {
    const { url } = req.body ?? {};
    if (!url) {
      res.status(400).json({ error: 'URL is required' });
      return;
    }
    if (!isValidHttpUrl(url)) {
      res.status(400).json({ error: 'URL is not a valid HTTP URL' });
      return;
    }

    const store = readStore(storePath);
    const existing = Object.entries(store.urls).find(([, v]) => v.long_url === url || v.url === url);
    if (existing) {
      const [code] = existing;
      // normalize to long_url in response
      res.status(200).json({
        code,
        long_url: store.urls[code].long_url ?? store.urls[code].url,
        version: appVersion,
        build: appBuild,
      });
      return;
    }

    let code = generateCode(codeLength);
    while (store.urls[code]) {
      code = generateCode(codeLength);
    }

    // store canonical field `long_url` and initialize hits
    store.urls[code] = { long_url: url, created_at: nowIso(), hits: 0 };
    writeStore(storePath, store);

    res.status(201).json({
      code,
      long_url: url,
      version: appVersion,
      build: appBuild,
    });
  });

  app.get('/api/resolve/:code', (req, res) => {
    const { code } = req.params;
    const store = readStore(storePath);
    const entry = store.urls[code];

    if (!entry) {
      return res.status(404).json({ error: 'Not found' });
    }

    return res.json({
      code,
      long_url: entry.long_url ?? entry.url,
      environment: appEnv,
      version: appVersion,
      build: appBuild,
    });
  });

  app.get('/api/stats/:code', (req, res) => {
    const { code } = req.params;
    const store = readStore(storePath);
    const entry = store.urls[code];

    if (!entry) {
      return res.status(404).json({ error: 'Not found' });
    }

    return res.json({
      code,
      long_url: entry.long_url ?? entry.url,
      created_at: entry.created_at,
      hits: Number(entry.hits ?? 0),
      environment: appEnv,
      version: appVersion,
      build: appBuild,
    });
  });

  app.get('/ui', (_req, res) => {
    res.sendFile(path.resolve(__dirname, '..', 'public', 'index.html'));
  });

  app.get('/:code', (req, res) => {
    const { code } = req.params;
    const store = readStore(storePath);
    const entry = store.urls[code];

    if (!entry) {
      return res.status(404).json({ error: 'Not found' });
    }

    entry.hits = Number(entry.hits ?? 0) + 1;
    store.urls[code] = entry;
    writeStore(storePath, store);

    return res.redirect(302, entry.long_url ?? entry.url);
  });

  return app;
}

module.exports = { createApp };
