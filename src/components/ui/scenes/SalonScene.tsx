'use client'

export default function SalonScene() {
  return (
    <div className="absolute inset-0" style={{ opacity: 0.35 }}>
      {/* Window - top right with starry sky */}
      <div className="absolute top-[8%] right-[10%] w-[28%] h-[30%] rounded-lg border-2 border-white/20 overflow-hidden bg-gradient-to-b from-[#0d1b2a] to-[#1b2838]">
        {/* Stars */}
        {[
          { top: '15%', left: '20%', delay: '0s', dur: '2.5s' },
          { top: '30%', left: '60%', delay: '0.8s', dur: '3.2s' },
          { top: '10%', left: '80%', delay: '1.5s', dur: '2s' },
          { top: '45%', left: '35%', delay: '2.1s', dur: '2.8s' },
          { top: '25%', left: '50%', delay: '0.4s', dur: '3.5s' },
          { top: '55%', left: '75%', delay: '1.2s', dur: '2.2s' },
          { top: '20%', left: '10%', delay: '1.8s', dur: '3s' },
        ].map((s, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-white animate-[twinkle_var(--dur)_ease-in-out_infinite_var(--delay)]"
            style={{ top: s.top, left: s.left, '--delay': s.delay, '--dur': s.dur } as React.CSSProperties}
          />
        ))}
        {/* Rain drops in front of window */}
        {[
          { left: '10%', delay: '0s', dur: '1.2s' },
          { left: '25%', delay: '0.3s', dur: '1s' },
          { left: '45%', delay: '0.7s', dur: '1.4s' },
          { left: '65%', delay: '0.2s', dur: '0.9s' },
          { left: '80%', delay: '0.5s', dur: '1.1s' },
          { left: '90%', delay: '0.9s', dur: '1.3s' },
          { left: '35%', delay: '1.1s', dur: '1s' },
          { left: '55%', delay: '0.4s', dur: '1.2s' },
        ].map((r, i) => (
          <div
            key={`r${i}`}
            className="absolute w-[1px] h-3 bg-blue-300/40 animate-[rain_var(--dur)_linear_infinite_var(--delay)]"
            style={{ left: r.left, top: '-10px', '--delay': r.delay, '--dur': r.dur } as React.CSSProperties}
          />
        ))}
      </div>

      {/* Lamp - left side */}
      <div className="absolute top-[25%] left-[8%]">
        <div className="w-3 h-16 bg-amber-700/40 rounded-sm mx-auto" />
        <div className="w-10 h-10 rounded-full bg-amber-400/30 animate-[warm-pulse_4s_ease-in-out_infinite] blur-md -mt-6 -ml-1" />
        <div className="w-6 h-6 rounded-full bg-amber-300/50 absolute top-[2.2rem] left-1/2 -translate-x-1/2" />
      </div>

      {/* Couch silhouette - bottom */}
      <div className="absolute bottom-[8%] left-[20%] w-[40%] h-[10%] bg-[#2a1f3d]/40 rounded-t-2xl rounded-b-md" />
      <div className="absolute bottom-[14%] left-[18%] w-[6%] h-[8%] bg-[#2a1f3d]/40 rounded-t-lg" />
      <div className="absolute bottom-[14%] left-[56%] w-[6%] h-[8%] bg-[#2a1f3d]/40 rounded-t-lg" />

      {/* Sleeping cat - bottom right */}
      <div className="absolute bottom-[10%] right-[15%] animate-[breathe_3s_ease-in-out_infinite]" style={{ transformOrigin: 'bottom center' }}>
        {/* Body */}
        <div className="w-10 h-5 bg-[#4a3560]/50 rounded-full" />
        {/* Head */}
        <div className="w-5 h-4 bg-[#4a3560]/50 rounded-full absolute -top-2 -left-1" />
        {/* Ears */}
        <div className="absolute -top-4 left-0 w-0 h-0 border-l-[4px] border-r-[4px] border-b-[6px] border-l-transparent border-r-transparent border-b-[#4a3560]/50" />
        <div className="absolute -top-4 left-2.5 w-0 h-0 border-l-[4px] border-r-[4px] border-b-[6px] border-l-transparent border-r-transparent border-b-[#4a3560]/50" />
        {/* Tail */}
        <div className="absolute top-1 -right-3 w-6 h-1.5 bg-[#4a3560]/50 rounded-full rotate-[-20deg]" />
      </div>

      {/* Side table next to couch */}
      <div className="absolute bottom-[8%] left-[62%] w-[5%] h-[12%] bg-[#2a1f3d]/25 rounded-t-sm" />

      {/* TV / screen on wall */}
      <div className="absolute top-[30%] left-[30%] w-[22%] h-[14%] bg-[#0a0a14]/20 rounded-md border border-white/5" />
      <div className="absolute top-[32%] left-[32%] w-[18%] h-[10%] bg-cyan-500/4 rounded-sm animate-[warm-pulse_5s_ease-in-out_infinite]" />

      {/* Floating dust particles */}
      {[
        { top: '40%', left: '50%', delay: '0s', dur: '5s' },
        { top: '55%', left: '30%', delay: '2s', dur: '6.5s' },
        { top: '35%', left: '70%', delay: '1.2s', dur: '5.5s' },
        { top: '65%', left: '45%', delay: '3.5s', dur: '6s' },
      ].map((p, i) => (
        <div
          key={`dust${i}`}
          className="absolute w-[3px] h-[3px] rounded-full bg-white/8 animate-[float_var(--dur)_ease-in-out_infinite_var(--delay)]"
          style={{ top: p.top, left: p.left, '--delay': p.delay, '--dur': p.dur } as React.CSSProperties}
        />
      ))}

      {/* Rug texture on floor */}
      <div className="absolute bottom-0 left-[22%] w-[36%] h-[5%] bg-pink-400/6 rounded-full blur-sm" />
    </div>
  )
}
