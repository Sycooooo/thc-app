'use client'

export default function AccueilScene() {
  return (
    <div className="absolute inset-0" style={{ opacity: 0.35 }}>
      {/* Large window - top center with city skyline */}
      <div className="absolute top-[5%] left-1/2 -translate-x-1/2 w-[55%] h-[35%] rounded-lg border-2 border-white/15 overflow-hidden bg-gradient-to-b from-[#0a0f1e] to-[#151d30]">
        {/* Stars */}
        {[
          { top: '8%', left: '10%', delay: '0s', dur: '3s' },
          { top: '12%', left: '30%', delay: '1.2s', dur: '2.5s' },
          { top: '5%', left: '55%', delay: '0.5s', dur: '3.5s' },
          { top: '15%', left: '75%', delay: '2s', dur: '2s' },
          { top: '10%', left: '90%', delay: '1.5s', dur: '2.8s' },
          { top: '3%', left: '45%', delay: '0.8s', dur: '3.2s' },
          { top: '18%', left: '20%', delay: '2.5s', dur: '2.2s' },
        ].map((s, i) => (
          <div
            key={i}
            className="absolute w-[3px] h-[3px] rounded-full bg-white animate-[twinkle_var(--dur)_ease-in-out_infinite_var(--delay)]"
            style={{ top: s.top, left: s.left, '--delay': s.delay, '--dur': s.dur } as React.CSSProperties}
          />
        ))}

        {/* City skyline silhouettes */}
        <div className="absolute bottom-0 left-[5%] w-[8%] h-[35%] bg-[#1a1a2e]/60" />
        <div className="absolute bottom-0 left-[14%] w-[6%] h-[50%] bg-[#1a1a2e]/60" />
        <div className="absolute bottom-0 left-[21%] w-[10%] h-[40%] bg-[#1a1a2e]/60" />
        <div className="absolute bottom-0 left-[33%] w-[5%] h-[55%] bg-[#1a1a2e]/60" />
        <div className="absolute bottom-0 left-[39%] w-[8%] h-[30%] bg-[#1a1a2e]/60" />
        <div className="absolute bottom-0 left-[49%] w-[7%] h-[60%] bg-[#1a1a2e]/60" />
        <div className="absolute bottom-0 left-[58%] w-[10%] h-[38%] bg-[#1a1a2e]/60" />
        <div className="absolute bottom-0 left-[70%] w-[6%] h-[48%] bg-[#1a1a2e]/60" />
        <div className="absolute bottom-0 left-[78%] w-[9%] h-[42%] bg-[#1a1a2e]/60" />
        <div className="absolute bottom-0 left-[89%] w-[7%] h-[35%] bg-[#1a1a2e]/60" />
        {/* Building windows (lit) */}
        <div className="absolute bottom-[12%] left-[16%] w-1 h-1 bg-amber-300/40" />
        <div className="absolute bottom-[20%] left-[35%] w-1 h-1 bg-amber-300/40" />
        <div className="absolute bottom-[18%] left-[51%] w-1 h-1 bg-amber-200/30" />
        <div className="absolute bottom-[25%] left-[72%] w-1 h-1 bg-amber-300/40" />
        <div className="absolute bottom-[8%] left-[62%] w-1 h-1 bg-amber-200/30" />

        {/* Rain */}
        {[
          { left: '8%', delay: '0s', dur: '1.2s' },
          { left: '18%', delay: '0.2s', dur: '1s' },
          { left: '28%', delay: '0.5s', dur: '1.3s' },
          { left: '38%', delay: '0.1s', dur: '1.1s' },
          { left: '48%', delay: '0.7s', dur: '1.4s' },
          { left: '58%', delay: '0.3s', dur: '0.9s' },
          { left: '68%', delay: '0.6s', dur: '1.2s' },
          { left: '78%', delay: '0.4s', dur: '1.1s' },
          { left: '88%', delay: '0.8s', dur: '1.3s' },
          { left: '95%', delay: '0.15s', dur: '1s' },
        ].map((r, i) => (
          <div
            key={`rain${i}`}
            className="absolute w-[1px] h-3 bg-blue-300/30 animate-[rain_var(--dur)_linear_infinite_var(--delay)]"
            style={{ left: r.left, top: '-10px', '--delay': r.delay, '--dur': r.dur } as React.CSSProperties}
          />
        ))}
      </div>

      {/* Street lamp - bottom right */}
      <div className="absolute bottom-[8%] right-[15%]">
        {/* Pole */}
        <div className="w-1.5 h-20 bg-gray-500/30 mx-auto rounded-sm" />
        {/* Lamp head */}
        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-6 h-3 bg-gray-600/30 rounded-t-lg" />
        {/* Halo */}
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-16 h-16 bg-amber-300/15 rounded-full blur-lg animate-[warm-pulse_4s_ease-in-out_infinite]" />
      </div>

      {/* Floating dust particles */}
      {[
        { top: '50%', left: '20%', delay: '0s', dur: '6s' },
        { top: '60%', left: '45%', delay: '2s', dur: '7s' },
        { top: '45%', left: '70%', delay: '1s', dur: '5.5s' },
        { top: '70%', left: '30%', delay: '3s', dur: '6.5s' },
        { top: '55%', left: '80%', delay: '1.5s', dur: '5s' },
      ].map((p, i) => (
        <div
          key={`dust${i}`}
          className="absolute w-1 h-1 rounded-full bg-white/15 animate-[float_var(--dur)_ease-in-out_infinite_var(--delay)]"
          style={{ top: p.top, left: p.left, '--delay': p.delay, '--dur': p.dur } as React.CSSProperties}
        />
      ))}
    </div>
  )
}
