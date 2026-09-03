import { useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

function App() {
  const [url, setUrl] = useState('');
  const [shortUrl, setShortUrl] = useState('');
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setShortUrl('');
    setCopied(false);

    try {
      new URL(url);
    } catch {
      setStatus('Please enter a valid URL, including https://');
      return;
    }

    setIsLoading(true);
    setStatus('');

    try {
      const response = await fetch(`${API_URL}/api/shorten`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Could not shorten that URL.');

      const result = data.shortUrl || `${API_URL}/${data.shortCode}`;
      setShortUrl(result);
      setStatus('Your short link is ready.');
    } catch (error) {
      setStatus(error.message || 'Something went wrong. Is the backend running?');
    } finally {
      setIsLoading(false);
    }
  }

  async function copyShortUrl() {
    await navigator.clipboard.writeText(shortUrl);
    setCopied(true);
  }

  return (
    <main className="page-shell">
      <section className="shortener-card" aria-labelledby="page-title">
        <div className="brand-mark" aria-hidden="true">↗</div>
        <p className="eyebrow">LINKLITE</p>
        <h1 id="page-title">Make your links shorter.</h1>
        <p className="intro">Paste a long URL and get a clean, shareable link in seconds.</p>

        <form onSubmit={handleSubmit} noValidate>
          <label htmlFor="url">Enter URL</label>
          <div className="input-row">
            <input
              id="url"
              type="url"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              placeholder="https://example.com/very/long/url"
              autoComplete="url"
              spellCheck="false"
              required
            />
            <button type="submit" disabled={isLoading}>
              {isLoading ? 'Shortening…' : 'Shorten'}
            </button>
          </div>
        </form>

        <p className={`status ${status && !shortUrl ? 'error' : ''}`} role="status" aria-live="polite">
          {status}
        </p>

        {shortUrl && (
          <div className="result" aria-label="Shortened URL">
            <div>
              <span className="result-label">Your short URL</span>
              <a href={shortUrl} target="_blank" rel="noreferrer">{shortUrl}</a>
            </div>
            <button className="copy-button" type="button" onClick={copyShortUrl}>
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        )}

        <p className="api-note">API: <code>POST /api/shorten</code></p>
      </section>
    </main>
  );
}

export default App;
