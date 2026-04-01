'use client'

export default function StudioScene() {
  return (
    <div className="absolute inset-0" style={{ opacity: 0.35 }}>
      {/* Floating music notes */}
      {[
        { left: '15%', bottom: '30%', delay: '0s', dur: '4s', note: '\u266A' },
        { left: '35%', bottom: '25%', delay: '1.2s', dur: '5s', note: '\u266B' },
        { left: '55%', bottom: '35%', delay: '2.5s', dur: '4.5s', note: '\u266A' },
        { left: '70%', bottom: '20%', delay: '0.8s', dur: '5.5s', note: '\u266B' },
        { left: '25%', bottom: '40%', delay: '3s', dur: '4.2s', note: '\u266A' },
        { left: '80%', bottom: '28%', delay: '1.8s', dur: '4.8s', note: '\u266B' },
      ].map((n, i) => (
        <div
          key={i}
          className="absolute text-purple-300/40 text-lg animate-[music-float_var(--dur)_ease-out_infinite_var(--delay)]"
          style={{
            left: n.left,
            bottom: n.bottom,
            '--delay': n.delay,
            '--dur': n.dur,
          } as React.CSSProperties}
        >
          {n.note}
        </div>
      ))}

      {/* Spinning vinyl - center-left */}
      <div className="absolute bottom-[20%] left-[15%] w-24 h-24 animate-[spin-slow_8s_linear_infinite]">
        {/* Record */}
        <div className="w-full h-full rounded-full bg-[#1a1a2e]/50 border-2 border-gray-600/20">
          {/* Grooves */}
          <div className="absolute inset-2 rounded-full border border-gray-500/10" />
          <div className="absolute inset-4 rounded-full border border-gray-500/10" />
          <div className="absolute inset-6 rounded-full border border-gray-500/10" />
          <div className="absolute inset-8 rounded-full border border-gray-500/10" />
          {/* Label */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-purple-500/30" />
          {/* Center hole */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-black/40" />
        </div>
      </div>

      {/* LED spots at top */}
      {[
        { left: '15%', color: 'bg-purple-500/30', delay: '0s' },
        { left: '30%', color: 'bg-pink-500/25', delay: '0.5s' },
        { left: '50%', color: 'bg-cyan-500/25', delay: '1s' },
        { left: '70%', color: 'bg-purple-500/30', delay: '1.5s' },
        { left: '85%', color: 'bg-pink-500/25', delay: '2s' },
      ].map((led, i) => (
        <div
          key={`led${i}`}
          className={`absolute top-[5%] w-3 h-3 rounded-full ${led.color} animate-[twinkle_2s_ease-in-out_infinite_var(--delay)] blur-[2px]`}
          style={{ left: led.left, '--delay': led.delay } as React.CSSProperties}
        />
      ))}

      {/* Speaker - bottom right */}
      <div className="absolute bottom-[10%] right-[12%]">
        {/* Cabinet */}
        <div className="w-14 h-20 bg-[#1a1a2e]/40 rounded-lg border border-gray-600/15">
          {/* Top speaker cone */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full border-2 border-gray-500/20 bg-gray-800/20" />
          <div className="absolute top-3.5 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-gray-600/20" />
          {/* Bottom speaker cone */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full border-2 border-gray-500/20 bg-gray-800/20" />
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-gray-600/20" />
        </div>
      </div>

      {/* Ambient glow behind vinyl */}
      <div className="absolute bottom-[15%] left-[10%] w-36 h-36 bg-purple-500/8 blur-2xl rounded-full" />

      {/* Mixing board / equipment */}
      <div className="absolute bottom-[8%] left-[45%] w-[30%] h-[8%] bg-[#1a1a2e]/30 rounded-md border border-gray-600/10">
        {/* Sliders */}
        <div className="absolute top-1 left-[10%] w-[2px] h-3 bg-cyan-400/20 rounded-full" />
        <div className="absolute top-2 left-[25%] w-[2px] h-3 bg-cyan-400/20 rounded-full" />
        <div className="absolute top-1.5 left-[40%] w-[2px] h-3 bg-purple-400/20 rounded-full" />
        <div className="absolute top-1 left-[55%] w-[2px] h-3 bg-pink-400/20 rounded-full" />
        <div className="absolute top-2.5 left-[70%] w-[2px] h-3 bg-cyan-400/20 rounded-full" />
        <div className="absolute top-1.5 left-[85%] w-[2px] h-3 bg-purple-400/20 rounded-full" />
      </div>

      {/* Headphones hanging */}
      <div className="absolute top-[30%] right-[8%]">
        <div className="w-8 h-4 border-t-2 border-l-2 border-r-2 border-gray-500/15 rounded-t-full" />
        <div className="absolute -bottom-2 left-0 w-2.5 h-3 bg-gray-500/15 rounded-b-lg" />
        <div className="absolute -bottom-2 right-0 w-2.5 h-3 bg-gray-500/15 rounded-b-lg" />
      </div>

      {/* Cable on floor */}
      <div className="absolute bottom-[4%] left-[40%] w-20 h-[2px] bg-gray-500/10 rotate-[-5deg] rounded-full" />

      {/* Pink ambient glow top right */}
      <div className="absolute top-0 right-0 w-[30%] h-[30%] bg-pink-500/5 blur-2xl rounded-full" />
    </div>
  )
}
