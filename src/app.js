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
  app.use(express.json({ limit: '32kb' }));

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.get('/', (_req, res) => {
    res.json({
      message: 'URL Shortener API',
      environment: appEnv,
      version: appVersion,
      build: appBuild,
    });
  });

  app.get('/api/version', (_req, res) => {
    res.json({ version: appVersion, build: appBuild, environment: appEnv });
  });

  app.post('/api/shorten', (req, res) => {
    const longUrl = typeof req.body?.url === 'string' ? req.body.url.trim() : '';

    if (!longUrl) {
      return res.status(400).json({ error: "Missing 'url'" });
    }

    if (!isValidHttpUrl(longUrl)) {
      return res.status(400).json({ error: 'Invalid URL (must start with http/https)' });
    }

    const store = readStore(storePath);

    let existingCode = null;
    for (const [code, entry] of Object.entries(store.urls)) {
      if (entry?.long_url === longUrl) {
        existingCode = code;
        break;
      }
    }

    const createdAt = nowIso();

    let code = existingCode;
    if (!code) {
      for (let i = 0; i < 20; i += 1) {
        const candidate = generateCode(codeLength);
        if (!store.urls[candidate]) {
          store.urls[candidate] = { long_url: longUrl, created_at: createdAt, hits: 0 };
          code = candidate;
          break;
        }
      }

      if (!code) {
        return res.status(500).json({ error: 'Could not generate unique short code' });
      }

      writeStore(storePath, store);
    }

    const shortUrl = `${req.protocol}://${req.get('host')}/${code}`;
    return res.status(201).json({
      code,
      short_url: shortUrl,
      long_url: longUrl,
      environment: appEnv,
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
      long_url: entry.long_url,
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
      long_url: entry.long_url,
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

    return res.redirect(302, entry.long_url);
  });

  return app;
}

module.exports = { createApp };
