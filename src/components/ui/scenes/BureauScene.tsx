'use client'

export default function BureauScene() {
  return (
    <div className="absolute inset-0" style={{ opacity: 0.30 }}>
      {/* Desk lamp - left */}
      <div className="absolute top-[20%] left-[10%]">
        {/* Arm */}
        <div className="w-1.5 h-14 bg-gray-400/30 rounded-sm rotate-[15deg] origin-bottom" />
        {/* Head */}
        <div className="absolute -top-1 -left-2 w-8 h-3 bg-gray-500/30 rounded-full rotate-[15deg]" />
        {/* Halo */}
        <div className="absolute -top-4 -left-6 w-16 h-16 rounded-full bg-amber-300/20 animate-[warm-pulse_4s_ease-in-out_infinite] blur-md" />
      </div>

      {/* Bookshelf - right side */}
      <div className="absolute top-[15%] right-[8%] w-[18%] h-[45%]">
        {/* Shelf boards */}
        <div className="absolute top-0 w-full h-[2px] bg-amber-900/20" />
        <div className="absolute top-[33%] w-full h-[2px] bg-amber-900/20" />
        <div className="absolute top-[66%] w-full h-[2px] bg-amber-900/20" />
        <div className="absolute bottom-0 w-full h-[2px] bg-amber-900/20" />
        {/* Books - top shelf */}
        <div className="absolute top-[2px] left-[5%] w-[12%] h-[31%] bg-purple-500/25 rounded-[1px]" />
        <div className="absolute top-[2px] left-[20%] w-[10%] h-[31%] bg-amber-500/25 rounded-[1px]" />
        <div className="absolute top-[2px] left-[33%] w-[14%] h-[31%] bg-pink-500/25 rounded-[1px]" />
        <div className="absolute top-[6%] left-[50%] w-[11%] h-[27%] bg-cyan-500/20 rounded-[1px]" />
        <div className="absolute top-[2px] left-[64%] w-[13%] h-[31%] bg-violet-400/25 rounded-[1px]" />
        {/* Books - middle shelf */}
        <div className="absolute top-[34%] left-[8%] w-[15%] h-[30%] bg-rose-500/20 rounded-[1px]" />
        <div className="absolute top-[34%] left-[26%] w-[10%] h-[30%] bg-amber-600/25 rounded-[1px]" />
        <div className="absolute top-[38%] left-[40%] w-[12%] h-[26%] bg-emerald-500/20 rounded-[1px]" />
        <div className="absolute top-[34%] left-[55%] w-[14%] h-[30%] bg-purple-400/20 rounded-[1px]" />
        {/* Books - bottom shelf */}
        <div className="absolute top-[68%] left-[5%] w-[18%] h-[30%] bg-indigo-500/20 rounded-[1px]" />
        <div className="absolute top-[68%] left-[28%] w-[11%] h-[30%] bg-orange-500/20 rounded-[1px]" />
        <div className="absolute top-[72%] left-[42%] w-[13%] h-[26%] bg-pink-400/20 rounded-[1px]" />
      </div>

      {/* Post-its on wall */}
      {[
        { top: '22%', left: '35%', color: 'bg-yellow-300/20', rot: 'rotate-[3deg]' },
        { top: '20%', left: '42%', color: 'bg-pink-300/20', rot: 'rotate-[-2deg]' },
        { top: '25%', left: '48%', color: 'bg-cyan-300/20', rot: 'rotate-[5deg]' },
        { top: '18%', left: '38%', color: 'bg-green-300/15', rot: 'rotate-[-4deg]' },
      ].map((note, i) => (
        <div
          key={i}
          className={`absolute w-5 h-5 ${note.color} ${note.rot} rounded-[1px]`}
          style={{ top: note.top, left: note.left }}
        />
      ))}

      {/* Desk surface */}
      <div className="absolute bottom-[15%] left-[5%] w-[65%] h-[2px] bg-amber-800/20" />

      {/* Pencil on desk */}
      <div className="absolute bottom-[16%] left-[30%] w-12 h-[2px] bg-yellow-600/30 rotate-[12deg] rounded-full" />
      <div className="absolute bottom-[16.5%] left-[28.5%] w-2 h-[2px] bg-pink-400/30 rotate-[12deg] rounded-full" />

      {/* Monitor / laptop silhouette on desk */}
      <div className="absolute bottom-[16%] left-[15%] w-[20%] h-[18%] bg-[#1a1a2e]/15 rounded-t-lg border border-white/5" />
      <div className="absolute bottom-[15%] left-[18%] w-[14%] h-[2%] bg-[#1a1a2e]/15 rounded-b-sm" />

      {/* Screen glow */}
      <div className="absolute bottom-[20%] left-[17%] w-[16%] h-[12%] bg-cyan-400/5 blur-md rounded animate-[warm-pulse_6s_ease-in-out_infinite]" />

      {/* Clock on wall */}
      <div className="absolute top-[15%] left-[55%] w-6 h-6 rounded-full border border-white/10 bg-white/3">
        <div className="absolute top-1/2 left-1/2 w-[1px] h-2 bg-white/15 origin-bottom -translate-x-1/2 -translate-y-full rotate-[30deg]" />
        <div className="absolute top-1/2 left-1/2 w-[1px] h-1.5 bg-white/20 origin-bottom -translate-x-1/2 -translate-y-full rotate-[-60deg]" />
      </div>

      {/* Coffee mug on desk */}
      <div className="absolute bottom-[16%] left-[48%]">
        <div className="w-4 h-4 bg-white/8 rounded-b-md rounded-t-sm" />
        <div className="absolute top-0.5 right-[-3px] w-1.5 h-2.5 border border-white/8 rounded-r-full border-l-transparent" />
      </div>
    </div>
  )
}
