import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createServer } from 'node:net';
import { mkdtemp, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { once } from 'node:events';
import { setTimeout as delay } from 'node:timers/promises';
import sqlite3 from 'sqlite3';

function freePort() {
  return new Promise((resolve, reject) => {
    const server = createServer();
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address();
      server.close((error) => error ? reject(error) : resolve(port));
    });
  });
}

function run(db, sql, values = []) {
  return new Promise((resolve, reject) => db.run(sql, values, (error) => error ? reject(error) : resolve()));
}

test('shortener accepts web URLs and never redirects a stored non-web URL', async (t) => {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'shortener-test-'));
  const databasePath = path.join(directory, 'urls.db');
  const port = await freePort();
  const base = `http://127.0.0.1:${port}`;
  const projectRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
  const child = spawn(process.execPath, ['server.js'], {
    cwd: projectRoot,
    env: { ...process.env, PORT: String(port), DATABASE_PATH: databasePath },
    stdio: 'ignore',
  });
  t.after(async () => {
    if (child.exitCode === null) {
      child.kill();
      await once(child, 'exit');
    }
    await rm(directory, { recursive: true, force: true });
  });

  let ready = false;
  for (let attempt = 0; attempt < 100; attempt += 1) {
    if (child.exitCode !== null) throw new Error(`server exited with ${child.exitCode}`);
    try {
      const response = await fetch(`${base}/not-found`);
      if (response.status === 404) { ready = true; break; }
    } catch { /* wait for the listener */ }
    await delay(50);
  }
  assert.ok(ready, 'server did not become ready');

  const rejected = await fetch(`${base}/api/shorten`, {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ url: 'javascript:alert(1)' }),
  });
  assert.equal(rejected.status, 400);

  const created = await fetch(`${base}/api/shorten`, {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ url: 'https://example.com/path' }),
  });
  assert.equal(created.status, 200);
  const { shortCode } = await created.json();
  const redirect = await fetch(`${base}/${shortCode}`, { redirect: 'manual' });
  assert.equal(redirect.status, 302);
  assert.equal(redirect.headers.get('location'), 'https://example.com/path');

  const database = new sqlite3.Database(databasePath);
  await run(database, 'INSERT INTO urls (short_code, original_url) VALUES (?, ?)', ['legacy', 'javascript:alert(1)']);
  await new Promise((resolve, reject) => database.close((error) => error ? reject(error) : resolve()));
  const unsafe = await fetch(`${base}/legacy`, { redirect: 'manual' });
  assert.equal(unsafe.status, 410);
});
