'use client'

export default function ChambreScene() {
  return (
    <div className="absolute inset-0" style={{ opacity: 0.35 }}>
      {/* Window - top center with moon */}
      <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[20%] h-[22%] rounded-lg border-2 border-white/15 overflow-hidden bg-gradient-to-b from-[#0d1b2a] to-[#162032]">
        {/* Moon */}
        <div className="absolute top-[15%] right-[20%] w-6 h-6 rounded-full bg-yellow-100/70 shadow-[0_0_12px_rgba(255,255,200,0.4)]" />
        {/* Stars */}
        {[
          { top: '20%', left: '15%', delay: '0s', dur: '3s' },
          { top: '40%', left: '40%', delay: '1s', dur: '2.5s' },
          { top: '15%', left: '65%', delay: '2s', dur: '3.5s' },
          { top: '55%', left: '25%', delay: '0.5s', dur: '2s' },
        ].map((s, i) => (
          <div
            key={i}
            className="absolute w-[3px] h-[3px] rounded-full bg-white animate-[twinkle_var(--dur)_ease-in-out_infinite_var(--delay)]"
            style={{ top: s.top, left: s.left, '--delay': s.delay, '--dur': s.dur } as React.CSSProperties}
          />
        ))}
      </div>

      {/* Fairy lights - horizontal string across top */}
      <div className="absolute top-[6%] left-[10%] right-[10%] h-[1px] bg-white/10" />
      {[
        { left: '12%', color: 'bg-pink-400/50', delay: '0s' },
        { left: '22%', color: 'bg-amber-400/50', delay: '0.3s' },
        { left: '32%', color: 'bg-purple-400/50', delay: '0.6s' },
        { left: '42%', color: 'bg-cyan-400/50', delay: '0.9s' },
        { left: '52%', color: 'bg-pink-400/50', delay: '1.2s' },
        { left: '62%', color: 'bg-amber-400/50', delay: '1.5s' },
        { left: '72%', color: 'bg-purple-400/50', delay: '1.8s' },
        { left: '82%', color: 'bg-cyan-400/50', delay: '2.1s' },
      ].map((light, i) => (
        <div
          key={i}
          className={`absolute top-[6%] w-2.5 h-2.5 rounded-full ${light.color} animate-[twinkle_2s_ease-in-out_infinite_var(--delay)] blur-[1px]`}
          style={{ left: light.left, '--delay': light.delay } as React.CSSProperties}
        />
      ))}

      {/* Bedside lamp - bottom left */}
      <div className="absolute bottom-[20%] left-[8%]">
        <div className="w-2 h-8 bg-amber-800/30 rounded-sm mx-auto" />
        <div className="w-8 h-8 rounded-full bg-amber-300/25 animate-[warm-pulse_4s_ease-in-out_infinite] blur-sm -mt-4 -ml-1" />
      </div>

      {/* Bed / blanket - bottom */}
      <div className="absolute bottom-0 left-[15%] w-[70%] h-[18%] bg-[#2a1f4d]/30 rounded-t-3xl" />
      <div className="absolute bottom-0 left-[20%] w-[60%] h-[12%] bg-[#3d2a5e]/25 rounded-t-2xl" />

      {/* Pillow */}
      <div className="absolute bottom-[14%] left-[25%] w-[15%] h-[5%] bg-white/8 rounded-full" />
      <div className="absolute bottom-[14%] left-[55%] w-[12%] h-[4%] bg-white/6 rounded-full" />

      {/* Stuffed animal on bed */}
      <div className="absolute bottom-[18%] right-[28%] animate-[breathe_4s_ease-in-out_infinite]" style={{ transformOrigin: 'bottom center' }}>
        <div className="w-5 h-4 bg-pink-300/15 rounded-full" />
        <div className="w-3 h-2.5 bg-pink-300/15 rounded-full absolute -top-2 left-1" />
        <div className="absolute -top-3 left-0.5 w-0 h-0 border-l-[3px] border-r-[3px] border-b-[4px] border-l-transparent border-r-transparent border-b-pink-300/15" />
        <div className="absolute -top-3 left-2 w-0 h-0 border-l-[3px] border-r-[3px] border-b-[4px] border-l-transparent border-r-transparent border-b-pink-300/15" />
      </div>

      {/* Wall poster / frame */}
      <div className="absolute top-[35%] left-[15%] w-[12%] h-[16%] border border-white/8 rounded-sm bg-purple-900/10" />

      {/* Floating dust particles */}
      {[
        { top: '45%', left: '40%', delay: '0s', dur: '5s' },
        { top: '55%', left: '65%', delay: '1.5s', dur: '6s' },
        { top: '35%', left: '80%', delay: '3s', dur: '5.5s' },
      ].map((p, i) => (
        <div
          key={`dust${i}`}
          className="absolute w-[3px] h-[3px] rounded-full bg-white/10 animate-[float_var(--dur)_ease-in-out_infinite_var(--delay)]"
          style={{ top: p.top, left: p.left, '--delay': p.delay, '--dur': p.dur } as React.CSSProperties}
        />
      ))}
    </div>
  )
}
