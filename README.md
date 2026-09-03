# LinkLite URL Shortener

A minimal React + Express + SQLite URL shortener.

## Run locally

```bash
npm install
npm run build
npm run server
```

Open http://localhost:4000.

## Render deployment

- Build command: `npm install && npm run build`
- Start command: `npm run server`
- Service type: Web Service

The SQLite database is local to the service. On free hosting, stored links may be lost when the service restarts or redeploys.
