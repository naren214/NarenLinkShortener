import { useEffect, useState } from 'react';
import Cubes from './components/Cubes.jsx';
import GradientWaves from './components/GradientWaves.jsx';

// Use the same origin in production (Render), while allowing Vite local development
// to point at the separate Express server on port 4000.
const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:4000' : '');

function LinkIcon({ size = 18 }) {
  return <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>;
}

function ArrowIcon() {
  return <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>;
}

function CopyIcon() {
  return <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect width="13" height="13" x="9" y="9" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>;
}

function CheckIcon() {
  return <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 4 4L19 6" /></svg>;
}

function App() {
  const [url, setUrl] = useState('');
  const [shortUrl, setShortUrl] = useState('');
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [recentLinks, setRecentLinks] = useState([]);

  useEffect(() => {
    try { setRecentLinks(JSON.parse(localStorage.getItem('linklite-recent') || '[]')); } catch { setRecentLinks([]); }
  }, []);

  async function handleSubmit(event) {
    event.preventDefault(); setShortUrl(''); setCopied(false);
    try { new URL(url); } catch { setStatus('Enter a complete URL, including https://'); return; }
    setIsLoading(true); setStatus('');
    try {
      const response = await fetch(`${API_URL}/api/shorten`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Could not shorten that URL.');
      const result = data.shortUrl || `${window.location.origin}/${data.shortCode}`;
      setShortUrl(result); setStatus('Link shortened successfully.'); setUrl('');
      const nextLinks = [{ shortUrl: result, originalUrl: url }, ...recentLinks.filter((link) => link.shortUrl !== result)].slice(0, 3);
      setRecentLinks(nextLinks); localStorage.setItem('linklite-recent', JSON.stringify(nextLinks));
    } catch (error) { setStatus(error.message || 'Something went wrong. Is the backend running?'); }
    finally { setIsLoading(false); }
  }

  async function copyShortUrl(value = shortUrl) {
    await navigator.clipboard.writeText(value);
    if (value === shortUrl) { setCopied(true); window.setTimeout(() => setCopied(false), 1800); }
  }

  return <div className="app-shell">
    <div className="site-waves">
      <GradientWaves horizonColor="#4935d4" waveColor="#f04fa8" crestColor="#fff7e6" speed={4} amplitude={3.5} waveScale={0.6} waveRatio={0.9} swell={35} turbulence={20} tilt={1.11} zoom={1} height={5.5} fogDepth={15} detail="medium" brightness={1.05} opacity={0.72} mouseInteraction parallaxStrength={0.5} grain grainIntensity={0.05} />
    </div>
    <header className="site-header">
      <a className="logo" href="/" aria-label="LinkLite home"><span className="logo-mark"><LinkIcon size={18} /></span><span>link<span>lite</span></span></a>
      <nav aria-label="Main navigation"><a href="#how-it-works">How it works</a><a className="header-cta" href="#shorten">Start shortening <ArrowIcon /></a></nav>
    </header>

    <main>
      <section className="hero" aria-labelledby="page-title">
        <div className="hero-copy">
          <div className="hero-kicker"><span className="kicker-index">/01</span><span>THE INTERNET, TIDIED UP</span></div>
          <h1 id="page-title">Make every<br /><span>link count.</span></h1>
          <p className="hero-description">A faster, cleaner way to shorten the URLs you actually want to share.</p>
          <div className="hero-meta"><span className="live-dot" /> <span>Live and ready</span><span className="meta-divider" /><span>Free, no account needed</span></div>
        </div>
        <div className="visual-frame" aria-hidden="true">
          <div className="visual-label">LINK / 001</div>
          <Cubes gridSize={7} maxAngle={42} radius={2} borderStyle="1px solid #b9a6d6" faceColor="#202033" rippleColor="#ff694e" rippleSpeed={1.4} autoAnimate rippleOnClick />
          <div className="visual-word">SHORT<br /><span>IT.</span></div>
          <div className="visual-corner">↘</div>
        </div>
      </section>

      <section className="shorten-section" id="shorten" aria-labelledby="shorten-title">
        <div className="section-index">/02</div>
        <div className="shorten-intro"><p className="section-kicker">THE ONLY STEP</p><h2 id="shorten-title">Drop a long one<br />in the box.</h2></div>
        <div className="shorten-card">
          <form onSubmit={handleSubmit} noValidate aria-busy={isLoading}>
            <label htmlFor="url">Your original URL</label>
            <div className="input-row"><span className="input-icon"><LinkIcon size={18} /></span><input id="url" type="url" value={url} onChange={(event) => setUrl(event.target.value)} placeholder="https://paste-your-link-here.com" autoComplete="url" spellCheck="false" required />{url && <button className="clear-button" type="button" aria-label="Clear URL" onClick={() => setUrl('')}>×</button>}</div>
            <button className="submit-button" type="submit" disabled={isLoading}><span>{isLoading ? 'Making it shorter…' : 'Shorten this URL'}</span><ArrowIcon /></button>
          </form>
          <p className={`status ${status && !shortUrl ? 'error' : ''}`} role="status" aria-live="polite">{status}</p>
          {shortUrl && <div className="result-card"><div className="result-check"><CheckIcon /></div><div className="result-content"><span className="result-label">Your short link</span><a href={shortUrl} target="_blank" rel="noreferrer">{shortUrl}</a></div><button className="copy-button" type="button" onClick={() => copyShortUrl()}>{copied ? 'Copied' : 'Copy'} {copied ? <CheckIcon /> : <CopyIcon />}</button></div>}
          <p className="card-note">No login. No tracking. Just a shorter link.</p>
        </div>
      </section>

      <section className="process-section" id="how-it-works" aria-labelledby="process-title"><div className="section-heading"><p className="section-kicker">THE SIMPLE VERSION</p><h2 id="process-title">Less URL.<br />More you.</h2></div><div className="process-grid"><article><span>/ 01</span><h3>Paste</h3><p>Bring the long, unwieldy link. We’ll take it from here.</p></article><article><span>/ 02</span><h3>Shorten</h3><p>One click creates a clean link stored safely in SQLite.</p></article><article><span>/ 03</span><h3>Share</h3><p>Copy the result and send it anywhere the internet goes.</p></article></div></section>

      {recentLinks.length > 0 && <section className="recent-section" aria-labelledby="recent-title"><div className="section-heading compact"><div><p className="section-kicker">LOCAL HISTORY</p><h2 id="recent-title">Your last few links.</h2></div><span>Stored on this device</span></div><div className="recent-list">{recentLinks.map((link) => <div className="recent-item" key={link.shortUrl}><div className="recent-icon"><LinkIcon size={15} /></div><div className="recent-copy"><a href={link.shortUrl} target="_blank" rel="noreferrer">{link.shortUrl.replace(/^https?:\/\//, '')}</a><span>{link.originalUrl}</span></div><button className="recent-copy-button" type="button" aria-label={`Copy ${link.shortUrl}`} onClick={() => copyShortUrl(link.shortUrl)}><CopyIcon /></button></div>)}</div></section>}

      <section className="creator-section" aria-labelledby="creator-title"><div className="creator-index">/04</div><div className="creator-copy"><p className="section-kicker">MADE WITH INTENTION</p><h2 id="creator-title">Built by Naren.<br /><span>Made to be shared.</span></h2></div><div className="creator-detail"><p>Naren K S is a CSE student at VIT Chennai who designed and engineered LinkLite—from the animated interface to the working React, Express, and SQLite stack.</p><a href="https://github.com/naren214/LinkShortener" target="_blank" rel="noreferrer">View the build <ArrowIcon /></a></div></section>
    </main>

    <footer className="site-footer"><span>LINKLITE / 2026</span><span>Short links, thoughtfully made.</span><span>Built for the open web ↗</span></footer>
  </div>;
}

export default App;
