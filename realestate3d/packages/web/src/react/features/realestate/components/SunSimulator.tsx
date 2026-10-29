import { useState, useEffect, useCallback } from 'react';

interface SunSimulatorProps {
  onTimeChange: (hour: number) => void;
}

const HOURS = [
  { h: 6,  label: 'Dawn',      icon: '🌅', sky: 'from-orange-900/60 to-pink-900/40' },
  { h: 9,  label: 'Morning',   icon: '🌤️', sky: 'from-sky-700/40 to-amber-600/20' },
  { h: 12, label: 'Noon',      icon: '☀️', sky: 'from-sky-500/30 to-blue-400/20' },
  { h: 15, label: 'Afternoon', icon: '🌞', sky: 'from-yellow-700/40 to-sky-600/30' },
  { h: 18, label: 'Sunset',    icon: '🌇', sky: 'from-orange-600/50 to-purple-900/40' },
  { h: 21, label: 'Night',     icon: '🌙', sky: 'from-indigo-950/70 to-blue-950/60' },
];

function formatHour(h: number) {
  const hour12 = h % 12 || 12;
  return `${hour12}:00 ${h < 12 ? 'AM' : 'PM'}`;
}

function getSunPosition(hour: number) {
  // Returns { x: 0-100%, y: 0-100% } for sun position arc
  const angle = ((hour - 6) / 12) * Math.PI; // 6 AM → 0, 18 PM → π
  const x = Math.sin(angle) * 100;
  const y = 50 - Math.cos(angle) * 50;
  return { x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) };
}

export function SunSimulator({ onTimeChange }: SunSimulatorProps) {
  const [hour, setHour] = useState(10);
  const [isPlaying, setIsPlaying] = useState(false);

  const currentPreset = HOURS.reduce((prev, curr) => 
    Math.abs(curr.h - hour) < Math.abs(prev.h - hour) ? curr : prev
  );

  const sunPos = getSunPosition(hour);
  const isNight = hour < 6 || hour >= 20;

  const handleChange = useCallback((h: number) => {
    setHour(h);
    onTimeChange(h);
  }, [onTimeChange]);

  // Auto-play
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setHour(prev => {
        const next = prev >= 23 ? 0 : prev + 0.5;
        onTimeChange(next);
        return next;
      });
    }, 150);
    return () => clearInterval(interval);
  }, [isPlaying, onTimeChange]);

  return (
    <div className="bg-gray-950/95 border border-white/10 rounded-2xl overflow-hidden shadow-2xl w-72">

      {/* Sky Preview Arc */}
      <div className={`relative h-28 bg-gradient-to-b ${currentPreset.sky} overflow-hidden`}>
        {/* Horizon line */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-white/10" />

        {/* Ground silhouette */}
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-gray-900/80 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-4 bg-gray-900" />

        {/* Building silhouettes */}
        {[15, 25, 45, 60, 75, 88].map((x, i) => (
          <div
            key={i}
            className="absolute bottom-4 bg-gray-800/80"
            style={{
              left: `${x}%`,
              width: `${4 + (i % 3) * 3}%`,
              height: `${20 + (i % 4) * 15}px`,
            }}
          />
        ))}

        {/* Sun / Moon */}
        {!isNight ? (
          <div
            className="absolute w-8 h-8 rounded-full bg-yellow-300 shadow-lg shadow-yellow-300/60 flex items-center justify-center text-sm transition-all duration-300"
            style={{
              left: `calc(${sunPos.x}% - 16px)`,
              top: `${sunPos.y}%`,
            }}
          >
            ☀️
          </div>
        ) : (
          <div className="absolute top-4 right-8 text-2xl">🌙</div>
        )}

        {/* Stars at night */}
        {isNight && [10, 25, 40, 60, 75, 85].map((x, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-white/60 animate-pulse"
            style={{ left: `${x}%`, top: `${10 + (i % 3) * 12}%`, animationDelay: `${i * 0.3}s` }}
          />
        ))}

        {/* Time badge */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 bg-black/50 backdrop-blur-sm rounded-full">
          <span>{currentPreset.icon}</span>
          <span className="text-xs font-bold text-white">{formatHour(Math.round(hour))}</span>
          <span className="text-[10px] text-white/50">{currentPreset.label}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-white/70 uppercase tracking-wider">Sun Path Simulator</span>
          <button
            onClick={() => setIsPlaying(p => !p)}
            className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-colors ${
              isPlaying
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'bg-white/10 text-white/60 hover:bg-white/15'
            }`}
          >
            {isPlaying ? '⏸ Pause' : '▶ Animate'}
          </button>
        </div>

        {/* Time Slider */}
        <div className="space-y-2">
          <input
            type="range"
            min={0}
            max={23}
            step={0.5}
            value={hour}
            onChange={e => handleChange(parseFloat(e.target.value))}
            className="w-full h-2 rounded-full cursor-pointer appearance-none"
            style={{
              background: `linear-gradient(to right, 
                #1e293b 0%, 
                #f97316 ${((6 / 23) * 100)}%, 
                #fbbf24 ${((12 / 23) * 100)}%, 
                #f97316 ${((18 / 23) * 100)}%, 
                #1e293b 100%)`,
            }}
          />
          <div className="flex justify-between text-[9px] text-white/30">
            <span>12 AM</span>
            <span>6 AM</span>
            <span>12 PM</span>
            <span>6 PM</span>
            <span>11 PM</span>
          </div>
        </div>

        {/* Preset Buttons */}
        <div className="grid grid-cols-3 gap-1.5">
          {HOURS.map(preset => (
            <button
              key={preset.h}
              onClick={() => { handleChange(preset.h); setIsPlaying(false); }}
              className={`py-1.5 rounded-lg text-center transition-all ${
                Math.abs(hour - preset.h) < 1.5
                  ? 'bg-amber-500/25 border border-amber-500/40 text-amber-200'
                  : 'bg-white/5 hover:bg-white/10 text-white/50 hover:text-white/70'
              }`}
            >
              <div className="text-base">{preset.icon}</div>
              <div className="text-[9px] font-medium mt-0.5">{preset.label}</div>
            </button>
          ))}
        </div>

        {/* Light Quality Readout */}
        <div className="grid grid-cols-2 gap-2 text-[10px]">
          {[
            { label: 'Light Quality', value: hour >= 9 && hour <= 16 ? 'Optimal ✓' : hour >= 6 && hour < 9 ? 'Golden Hour 🌅' : hour > 16 && hour <= 19 ? 'Golden Hour 🌇' : 'Low Light 🌙', color: hour >= 6 && hour <= 19 ? 'text-emerald-400' : 'text-blue-400' },
            { label: 'Shadow Length', value: hour === 12 ? 'Minimal' : (Math.abs(hour - 12) > 4 ? 'Long' : 'Medium'), color: 'text-white/60' },
          ].map(stat => (
            <div key={stat.label} className="bg-white/5 rounded-lg p-2">
              <div className="text-white/40">{stat.label}</div>
              <div className={`font-semibold mt-0.5 ${stat.color}`}>{stat.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
