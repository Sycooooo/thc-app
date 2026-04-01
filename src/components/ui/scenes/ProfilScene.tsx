'use client'

export default function ProfilScene() {
  return (
    <div className="absolute inset-0" style={{ opacity: 0.30 }}>
      {/* Central spotlight */}
      <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[50%] h-[50%] rounded-full bg-amber-300/10 blur-3xl animate-[warm-pulse_5s_ease-in-out_infinite]" />

      {/* Sparkles that appear and disappear */}
      {[
        { top: '15%', left: '25%', delay: '0s', dur: '3s', size: 'w-2 h-2' },
        { top: '20%', left: '78%', delay: '0.8s', dur: '2.5s', size: 'w-1.5 h-1.5' },
        { top: '40%', left: '15%', delay: '1.5s', dur: '3.5s', size: 'w-2 h-2' },
        { top: '35%', left: '83%', delay: '2.2s', dur: '2.8s', size: 'w-1.5 h-1.5' },
        { top: '55%', left: '30%', delay: '0.5s', dur: '3.2s', size: 'w-1 h-1' },
        { top: '50%', left: '68%', delay: '1.8s', dur: '2.2s', size: 'w-2 h-2' },
        { top: '65%', left: '20%', delay: '2.8s', dur: '3s', size: 'w-1.5 h-1.5' },
        { top: '60%', left: '73%', delay: '0.3s', dur: '3.8s', size: 'w-1 h-1' },
        { top: '30%', left: '45%', delay: '3.5s', dur: '2.5s', size: 'w-1.5 h-1.5' },
        { top: '70%', left: '58%', delay: '1.2s', dur: '3.3s', size: 'w-2 h-2' },
      ].map((spark, i) => (
        <div
          key={i}
          className={`absolute ${spark.size} rounded-full bg-purple-300/50 animate-[sparkle_var(--dur)_ease-in-out_infinite_var(--delay)]`}
          style={{
            top: spark.top,
            left: spark.left,
            '--delay': spark.delay,
            '--dur': spark.dur,
          } as React.CSSProperties}
        />
      ))}

      {/* Decorative corner ornaments */}
      {/* Top-left corner */}
      <div className="absolute top-[3%] left-[3%]">
        <div className="w-8 h-[2px] bg-purple-400/20" />
        <div className="w-[2px] h-8 bg-purple-400/20" />
        <div className="absolute top-1 left-1 w-2 h-2 border-t-2 border-l-2 border-purple-400/15" />
      </div>
      {/* Top-right corner */}
      <div className="absolute top-[3%] right-[3%]">
        <div className="w-8 h-[2px] bg-purple-400/20 ml-auto" />
        <div className="w-[2px] h-8 bg-purple-400/20 ml-auto" />
        <div className="absolute top-1 right-1 w-2 h-2 border-t-2 border-r-2 border-purple-400/15" />
      </div>
      {/* Bottom-left corner */}
      <div className="absolute bottom-[3%] left-[3%]">
        <div className="w-[2px] h-8 bg-purple-400/20" />
        <div className="w-8 h-[2px] bg-purple-400/20" />
        <div className="absolute bottom-1 left-1 w-2 h-2 border-b-2 border-l-2 border-purple-400/15" />
      </div>
      {/* Bottom-right corner */}
      <div className="absolute bottom-[3%] right-[3%]">
        <div className="w-[2px] h-8 bg-purple-400/20 ml-auto" />
        <div className="w-8 h-[2px] bg-purple-400/20 ml-auto" />
        <div className="absolute bottom-1 right-1 w-2 h-2 border-b-2 border-r-2 border-purple-400/15" />
      </div>

      {/* Extra ambient sparkle dots */}
      <div className="absolute top-[45%] left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-amber-300/30 animate-[sparkle_4s_ease-in-out_infinite_0.5s]" />

      {/* Soft radial rings */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[30%] h-[30%] rounded-full border border-purple-400/8 animate-[warm-pulse_6s_ease-in-out_infinite]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[50%] h-[50%] rounded-full border border-purple-400/5 animate-[warm-pulse_6s_ease-in-out_infinite_1s]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70%] h-[70%] rounded-full border border-purple-400/3 animate-[warm-pulse_6s_ease-in-out_infinite_2s]" />

      {/* Floating particles */}
      {[
        { top: '25%', left: '35%', delay: '0s', dur: '5s' },
        { top: '75%', left: '60%', delay: '2s', dur: '6s' },
        { top: '40%', left: '75%', delay: '1s', dur: '4.5s' },
        { top: '60%', left: '25%', delay: '3s', dur: '5.5s' },
      ].map((p, i) => (
        <div
          key={`p${i}`}
          className="absolute w-[3px] h-[3px] rounded-full bg-amber-300/15 animate-[float_var(--dur)_ease-in-out_infinite_var(--delay)]"
          style={{ top: p.top, left: p.left, '--delay': p.delay, '--dur': p.dur } as React.CSSProperties}
        />
      ))}
    </div>
  )
}
