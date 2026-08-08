import { useEffect, useRef } from 'react';

function getScoreColor(score) {
  if (score >= 75) return '#10b981';
  if (score >= 50) return '#f59e0b';
  return '#ef4444';
}

function getScoreLabel(score) {
  if (score >= 75) return 'Excellent';
  if (score >= 60) return 'Good';
  if (score >= 50) return 'Fair';
  if (score >= 35) return 'Poor';
  return 'Very Poor';
}

export default function RiskScoreGauge({ score = 0, size = 200, animated = true }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const currentScore = useRef(0);

  const color = getScoreColor(score);
  const label = getScoreLabel(score);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const radius = (canvas.width / 2) - 20;
    const startAngle = Math.PI * 0.75;
    const endAngle = Math.PI * 2.25;
    const totalArc = endAngle - startAngle;

    function draw(displayScore) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Background track
      ctx.beginPath();
      ctx.arc(cx, cy, radius, startAngle, endAngle);
      ctx.strokeStyle = 'rgba(255,255,255,0.08)';
      ctx.lineWidth = 16;
      ctx.lineCap = 'round';
      ctx.stroke();

      // Zone markers
      const zones = [
        { end: 0.50, color: 'rgba(239,68,68,0.25)' },
        { end: 0.75, color: 'rgba(245,158,11,0.25)' },
        { end: 1.00, color: 'rgba(16,185,129,0.25)' },
      ];
      let zoneStart = startAngle;
      zones.forEach(zone => {
        ctx.beginPath();
        ctx.arc(cx, cy, radius, zoneStart, startAngle + totalArc * zone.end);
        ctx.strokeStyle = zone.color;
        ctx.lineWidth = 8;
        ctx.stroke();
        zoneStart = startAngle + totalArc * zone.end;
      });

      // Filled arc (score)
      if (displayScore > 0) {
        const scoreAngle = startAngle + (displayScore / 100) * totalArc;
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
        gradient.addColorStop(0, '#ef4444');
        gradient.addColorStop(0.5, '#f59e0b');
        gradient.addColorStop(1, '#10b981');

        ctx.beginPath();
        ctx.arc(cx, cy, radius, startAngle, scoreAngle);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 16;
        ctx.lineCap = 'round';
        ctx.stroke();

        // Glowing dot at end
        const dotX = cx + radius * Math.cos(scoreAngle);
        const dotY = cy + radius * Math.sin(scoreAngle);
        ctx.beginPath();
        ctx.arc(dotX, dotY, 8, 0, Math.PI * 2);
        ctx.fillStyle = getScoreColor(displayScore);
        ctx.shadowColor = getScoreColor(displayScore);
        ctx.shadowBlur = 15;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // Center circle
      const centerGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius * 0.6);
      centerGrad.addColorStop(0, 'rgba(20,20,50,0.95)');
      centerGrad.addColorStop(1, 'rgba(10,10,30,0.95)');
      ctx.beginPath();
      ctx.arc(cx, cy, radius - 24, 0, Math.PI * 2);
      ctx.fillStyle = centerGrad;
      ctx.fill();
    }

    if (animated) {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      const duration = 1200;
      const start = performance.now();
      const from = currentScore.current;

      function animate(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 4);
        const current = from + (score - from) * eased;
        draw(current);
        currentScore.current = current;
        if (progress < 1) {
          animRef.current = requestAnimationFrame(animate);
        }
      }
      animRef.current = requestAnimationFrame(animate);
    } else {
      draw(score);
      currentScore.current = score;
    }

    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [score, animated]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        <canvas ref={canvasRef} width={size} height={size} />
        {/* Score text overlay */}
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          paddingTop: '10%',
        }}>
          <div style={{
            fontFamily: 'Outfit, sans-serif',
            fontSize: size * 0.22,
            fontWeight: 900,
            color: color,
            lineHeight: 1,
            textShadow: `0 0 20px ${color}60`,
          }}>
            {Math.round(score)}
          </div>
          <div style={{
            fontSize: size * 0.072,
            color: 'rgba(255,255,255,0.5)',
            fontWeight: 500,
            marginTop: 4,
          }}>
            / 100
          </div>
        </div>
      </div>
      <div style={{
        fontSize: '0.9rem',
        fontWeight: 700,
        color,
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        textShadow: `0 0 12px ${color}60`,
      }}>
        {label}
      </div>
    </div>
  );
}
