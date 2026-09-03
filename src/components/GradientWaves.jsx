import { useEffect, useId, useState } from 'react';
import './GradientWaves.css';

// Lightweight wave-field inspired by React Bits Gradient Waves.
// Tuned as a decorative background layer for LinkLite.
export default function GradientWaves({
  horizonColor = '#5227FF',
  waveColor = '#FF9FFC',
  crestColor = '#FFFFFF',
  speed = 0.4,
  amplitude = 2.5,
  waveScale = 0.6,
  waveRatio = 0.9,
  swell = 35,
  turbulence = 20,
  tilt = 1.11,
  zoom = 1,
  height = 5.5,
  fogDepth = 15,
  detail = 'medium',
  brightness = 1,
  opacity = 1,
  mouseInteraction = false,
  parallaxStrength = 0.5,
  grain = false,
  grainIntensity = 0.05,
}) {
  const id = useId().replace(/:/g, '');
  const [pointer, setPointer] = useState({ x: 0, y: 0 });
  const waves = detail === 'high' ? 5 : detail === 'low' ? 2 : 3;

  useEffect(() => {
    if (!mouseInteraction) return undefined;
    const move = (event) => setPointer({ x: (event.clientX / window.innerWidth - 0.5) * parallaxStrength, y: (event.clientY / window.innerHeight - 0.5) * parallaxStrength });
    window.addEventListener('pointermove', move, { passive: true });
    return () => window.removeEventListener('pointermove', move);
  }, [mouseInteraction, parallaxStrength]);

  return <div className="gradient-waves" aria-hidden="true" style={{ '--wave-speed': `${Math.max(.22, 9 / Math.max(speed, .1))}s`, '--wave-opacity': opacity, '--wave-brightness': brightness, '--grain-opacity': grain ? grainIntensity : 0, '--move-x': `${pointer.x * 14}px`, '--move-y': `${pointer.y * 10}px`, '--wave-scale': waveScale, '--wave-ratio': waveRatio, '--swell': swell, '--turbulence': turbulence, '--tilt': tilt, '--zoom': zoom, '--wave-height': height, '--fog-depth': fogDepth, '--amplitude': amplitude }}>
    <svg viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" role="presentation">
      <defs>
        <linearGradient id={`horizon-${id}`} x1="0" x2="1" y1="0" y2="1"><stop stopColor={horizonColor} stopOpacity=".9" /><stop offset="1" stopColor={waveColor} stopOpacity=".35" /></linearGradient>
        <linearGradient id={`wave-${id}`} x1="0" x2="1" y1="0" y2=".8"><stop stopColor={waveColor} stopOpacity=".48" /><stop offset=".52" stopColor={horizonColor} stopOpacity=".22" /><stop offset="1" stopColor={crestColor} stopOpacity=".1" /></linearGradient>
        <filter id={`blur-${id}`} x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="5" /></filter>
        <filter id={`grain-${id}`} x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="4" /><feColorMatrix type="saturate" values="0" /></filter>
      </defs>
      <rect width="1440" height="900" fill={`url(#horizon-${id})`} />
      <path className="wave horizon" d="M-80 490 C130 380 270 560 490 465 S850 355 1060 465 S1320 550 1520 405 L1520 900 L-80 900 Z" fill={`url(#wave-${id})`} />
      {Array.from({ length: waves }, (_, index) => <path key={index} className={`wave wave-${index + 1}`} d={`M-120 ${530 + index * 64} C 110 ${410 + index * 26}, 265 ${650 - index * 22}, 470 ${535 + index * 12} S 820 ${400 + index * 22}, 1040 ${540 + index * 20} S 1320 ${660 - index * 35}, 1560 ${510 + index * 28} L 1560 940 L -120 940 Z`} fill={`url(#wave-${id})`} />)}
      <path className="crest" d="M-100 500 C130 405 270 575 490 478 S850 370 1060 478 S1320 565 1540 418" fill="none" stroke={crestColor} strokeOpacity=".64" strokeWidth="2" filter={`url(#blur-${id})`} />
      {grain && <rect width="1440" height="900" filter={`url(#grain-${id})`} opacity={grainIntensity} />}
    </svg>
  </div>;
}
