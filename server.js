import crypto from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import cors from 'cors';
import sqlite3 from 'sqlite3';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = process.env.PORT || 4000;
const db = new sqlite3.Database(path.join(__dirname, 'urls.db'));

app.use(cors());
app.use(express.json());

db.run(`
  CREATE TABLE IF NOT EXISTS urls (
    short_code TEXT PRIMARY KEY,
    original_url TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )
`);

function createShortCode() {
  return crypto.randomBytes(4).toString('base64url').slice(0, 6);
}

app.post('/api/shorten', (req, res) => {
  const { url } = req.body;

  try {
    new URL(url);
  } catch {
    return res.status(400).json({ error: 'Please provide a valid URL.' });
  }

  const shortCode = createShortCode();
  db.run(
    'INSERT INTO urls (short_code, original_url) VALUES (?, ?)',
    [shortCode, url],
    (error) => {
      if (error) return res.status(500).json({ error: 'Could not save the URL.' });
      res.json({ shortCode, shortUrl: `${req.protocol}://${req.get('host')}/${shortCode}` });
    },
  );
});

app.get('/:shortCode', (req, res, next) => {
  if (req.params.shortCode === 'favicon.ico') return next();

  db.get(
    'SELECT original_url FROM urls WHERE short_code = ?',
    [req.params.shortCode],
    (error, row) => {
      if (error) return res.status(500).send('Database error.');
      if (!row) return res.status(404).send('Short URL not found.');
      res.redirect(row.original_url);
    },
  );
});

const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));
app.get('/', (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'), (error) => {
    if (error) res.send('URL shortener API is running. Start the frontend with: npm run dev');
  });
});

app.listen(port, () => {
  console.log(`URL shortener running at http://localhost:${port}`);
});
