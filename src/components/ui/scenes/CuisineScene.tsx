'use client'

export default function CuisineScene() {
  return (
    <div className="absolute inset-0" style={{ opacity: 0.35 }}>
      {/* Window - top right with warm daylight */}
      <div className="absolute top-[8%] right-[8%] w-[25%] h-[28%] rounded-lg border-2 border-white/15 overflow-hidden bg-gradient-to-b from-amber-200/20 to-amber-100/10">
        {/* Window cross */}
        <div className="absolute top-0 bottom-0 left-1/2 w-[1px] bg-white/15" />
        <div className="absolute left-0 right-0 top-1/2 h-[1px] bg-white/15" />
      </div>

      {/* Coffee cup - center left */}
      <div className="absolute bottom-[22%] left-[25%]">
        {/* Cup body */}
        <div className="w-10 h-8 bg-white/15 rounded-b-lg rounded-t-sm border border-white/10" />
        {/* Handle */}
        <div className="absolute top-1 right-[-6px] w-3 h-5 border-2 border-white/15 rounded-r-full border-l-transparent" />
        {/* Steam lines */}
        {[
          { left: '15%', delay: '0s', dur: '2s' },
          { left: '40%', delay: '0.6s', dur: '2.4s' },
          { left: '65%', delay: '1.2s', dur: '2.2s' },
        ].map((s, i) => (
          <div
            key={i}
            className="absolute w-[2px] h-4 bg-white/20 rounded-full animate-[steam_var(--dur)_ease-out_infinite_var(--delay)]"
            style={{
              left: s.left,
              top: '-12px',
              '--delay': s.delay,
              '--dur': s.dur,
            } as React.CSSProperties}
          />
        ))}
      </div>

      {/* Potted plant - right side */}
      <div className="absolute bottom-[15%] right-[25%]">
        {/* Pot */}
        <div className="w-8 h-7 bg-[#8B4513]/30 rounded-b-lg rounded-t-sm mx-auto" />
        {/* Soil */}
        <div className="w-8 h-1.5 bg-[#3e2723]/30 rounded-t-sm mx-auto -mt-1" />
        {/* Stem */}
        <div className="absolute bottom-7 left-1/2 -translate-x-1/2 w-[2px] h-10 bg-green-600/30" />
        {/* Leaves */}
        <div className="absolute bottom-14 left-1/2 -translate-x-1/2">
          <div className="absolute w-5 h-3 bg-green-500/25 rounded-full -rotate-[30deg] -left-3 -top-1" />
          <div className="absolute w-5 h-3 bg-green-500/25 rounded-full rotate-[30deg] left-0 -top-1" />
          <div className="absolute w-4 h-3 bg-green-400/25 rounded-full -rotate-[50deg] -left-4 top-2" />
          <div className="absolute w-4 h-3 bg-green-400/25 rounded-full rotate-[50deg] left-2 top-2" />
          <div className="absolute w-4 h-2.5 bg-green-500/30 rounded-full -left-1 -top-3" />
        </div>
      </div>

      {/* Counter surface */}
      <div className="absolute bottom-[14%] left-[10%] w-[80%] h-[2px] bg-amber-800/15" />

      {/* Small plate */}
      <div className="absolute bottom-[15%] left-[50%] w-12 h-1.5 bg-white/10 rounded-full" />

      {/* Warm ambient glow from window */}
      <div className="absolute top-[5%] right-[5%] w-[35%] h-[40%] bg-amber-300/8 blur-2xl rounded-full" />

      {/* Fruit bowl on counter */}
      <div className="absolute bottom-[15%] left-[65%]">
        <div className="w-10 h-3 bg-white/8 rounded-[50%]" />
        <div className="absolute -top-2 left-1 w-3 h-3 rounded-full bg-red-400/15" />
        <div className="absolute -top-1.5 left-4 w-3 h-3 rounded-full bg-yellow-400/15" />
        <div className="absolute -top-3 left-2.5 w-2.5 h-2.5 rounded-full bg-green-400/12" />
      </div>

      {/* Kitchen shelves on wall */}
      <div className="absolute top-[18%] left-[10%] w-[20%] h-[1px] bg-amber-700/15" />
      <div className="absolute top-[30%] left-[10%] w-[20%] h-[1px] bg-amber-700/15" />
      {/* Jars on shelf */}
      <div className="absolute top-[12%] left-[12%] w-3 h-5 bg-white/6 rounded-t-full rounded-b-sm" />
      <div className="absolute top-[13%] left-[18%] w-4 h-4 bg-amber-200/8 rounded-sm" />
      <div className="absolute top-[24%] left-[14%] w-3 h-5 bg-white/5 rounded-t-full rounded-b-sm" />
      <div className="absolute top-[25%] left-[22%] w-3.5 h-4 bg-green-200/6 rounded-sm" />

      {/* Towel hanging */}
      <div className="absolute bottom-[25%] left-[8%] w-[1px] h-8 bg-amber-700/15" />
      <div className="absolute bottom-[25%] left-[7%] w-4 h-6 bg-white/6 rounded-b-sm" />

      {/* Clock on wall */}
      <div className="absolute top-[10%] right-[35%] w-7 h-7 rounded-full border border-white/8">
        <div className="absolute top-1/2 left-1/2 w-[1px] h-2 bg-white/12 origin-bottom -translate-x-1/2 -translate-y-full rotate-[45deg]" />
        <div className="absolute top-1/2 left-1/2 w-[1px] h-1.5 bg-white/15 origin-bottom -translate-x-1/2 -translate-y-full rotate-[-30deg]" />
      </div>
    </div>
  )
}
