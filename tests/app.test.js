const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

const { createApp } = require('../src/app');

function makeTmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'url-shortener-'));
}

test('health endpoint', async (t) => {
  const tmpDir = makeTmpDir();
  t.after(() => fs.rmSync(tmpDir, { recursive: true, force: true }));

  const app = createApp({
    storePath: path.join(tmpDir, 'urls.json'),
    appEnv: 'test',
    appVersion: '1.2.3',
    appBuild: 'ci-1',
  });

  const server = app.listen(0);
  t.after(() => server.close());

  const base = `http://127.0.0.1:${server.address().port}`;

  const resp = await fetch(`${base}/health`);
  assert.equal(resp.status, 200);
  assert.deepEqual(await resp.json(), { status: 'ok' });
});

test('shorten → resolve → redirect increments hits', async (t) => {
  const tmpDir = makeTmpDir();
  t.after(() => fs.rmSync(tmpDir, { recursive: true, force: true }));

  const app = createApp({
    storePath: path.join(tmpDir, 'urls.json'),
    appEnv: 'qa',
    appVersion: '1.2.3',
    appBuild: 'ci-1',
  });

  const server = app.listen(0);
  t.after(() => server.close());

  const base = `http://127.0.0.1:${server.address().port}`;

  const shorten = await fetch(`${base}/api/shorten`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ url: 'https://example.com' }),
  });

  assert.equal(shorten.status, 201);
  const payload = await shorten.json();
  assert.equal(payload.long_url, 'https://example.com');
  assert.equal(payload.version, '1.2.3');
  assert.equal(payload.build, 'ci-1');
  assert.ok(payload.code);

  const code = payload.code;

  const resolve = await fetch(`${base}/api/resolve/${code}`);
  assert.equal(resolve.status, 200);
  const resolved = await resolve.json();
  assert.equal(resolved.long_url, 'https://example.com');

  const statsBefore = await fetch(`${base}/api/stats/${code}`);
  assert.equal(statsBefore.status, 200);
  assert.equal((await statsBefore.json()).hits, 0);

  const go = await fetch(`${base}/${code}`, { redirect: 'manual' });
  assert.equal(go.status, 302);
  assert.equal(go.headers.get('location'), 'https://example.com');

  const statsAfter = await fetch(`${base}/api/stats/${code}`);
  assert.equal(statsAfter.status, 200);
  assert.equal((await statsAfter.json()).hits, 1);
});

test('shorten rejects invalid URL', async (t) => {
  const tmpDir = makeTmpDir();
  t.after(() => fs.rmSync(tmpDir, { recursive: true, force: true }));

  const app = createApp({
    storePath: path.join(tmpDir, 'urls.json'),
    appEnv: 'test',
    appVersion: '1.2.3',
    appBuild: 'ci-1',
  });

  const server = app.listen(0);
  t.after(() => server.close());

  const base = `http://127.0.0.1:${server.address().port}`;

  const bad = await fetch(`${base}/api/shorten`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ url: 'javascript:alert(1)' }),
  });

  assert.equal(bad.status, 400);
});
