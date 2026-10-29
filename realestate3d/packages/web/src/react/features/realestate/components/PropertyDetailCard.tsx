import { useState } from 'react';
import type { RealEstateProperty } from '../data/properties';
import { useGameMethod } from '../../../hooks/useGameMethod';

interface PropertyDetailCardProps {
  property: RealEstateProperty;
  onOpenTour: () => void;
}

export function PropertyDetailCard({ property, onOpenTour }: PropertyDetailCardProps) {
  const {
    flyToRealEstateProperty,
    flyToRealEstateBalcony,
    toggleRealEstateOrbit,
    setRealEstateSunHour,
    setRealEstateOrbitSpeed,
  } = useGameMethod();

  const [isOrbiting, setIsOrbiting] = useState(true);
  const [sunHour, setSunHour] = useState(17.5); // Default to 5:30 PM golden hour
  const [showSunControl, setShowSunControl] = useState(false);

  const handleFlyAndOrbit = () => {
    flyToRealEstateProperty(property, true);
    setIsOrbiting(true);
  };

  const handleToggleOrbit = () => {
    const nextState = toggleRealEstateOrbit();
    setIsOrbiting(nextState);
  };

  const handleBalconyView = () => {
    flyToRealEstateBalcony();
    setIsOrbiting(false);
  };

  const handleSunChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setSunHour(val);
    setRealEstateSunHour(val);
  };

  const formatHour = (hour: number) => {
    const h = Math.floor(hour);
    const m = Math.floor((hour % 1) * 60);
    const period = h >= 12 ? 'PM' : 'AM';
    const displayH = h % 12 === 0 ? 12 : h % 12;
    const displayM = m < 10 ? `0${m}` : m;
    return `${displayH}:${displayM} ${period}`;
  };

  return (
    <div className="glass-panel p-5 w-full max-w-md pointer-events-auto animate-fade-in border border-white/10 shadow-2xl space-y-4">
      {/* Header Info */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">{property.flag}</span>
            <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">
              {property.city}, {property.country}
            </span>
          </div>
          <h2 className="text-lg font-bold text-white tracking-tight mt-0.5">{property.title}</h2>
          <p className="text-xs text-white/60 line-clamp-2 mt-0.5 leading-relaxed">{property.tagline}</p>
        </div>
        <div className="text-right shrink-0">
          <div className="text-base font-bold font-mono text-emerald-400">{property.priceFormatted}</div>
          <div className="text-[10px] text-white/40 uppercase">{property.specs.propertyType}</div>
        </div>
      </div>

      {/* Key Specs Row */}
      <div className="grid grid-cols-3 gap-2 py-2 px-3 bg-white/5 rounded-xl border border-white/5 text-center">
        <div>
          <div className="text-[10px] text-white/40 uppercase">Bedrooms</div>
          <div className="text-xs font-bold text-white font-mono">{property.specs.beds} Beds</div>
        </div>
        <div className="border-x border-white/10">
          <div className="text-[10px] text-white/40 uppercase">Bathrooms</div>
          <div className="text-xs font-bold text-white font-mono">{property.specs.baths} Baths</div>
        </div>
        <div>
          <div className="text-[10px] text-white/40 uppercase">Living Space</div>
          <div className="text-xs font-bold text-white font-mono">{property.specs.sqft.toLocaleString()} sqft</div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={handleFlyAndOrbit}
          className="px-3 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-blue-600/30 active:scale-[0.98]"
          title="Fly camera to property and initiate drone orbit"
        >
          <span>🚁 Fly & Orbit</span>
        </button>

        <button
          onClick={handleBalconyView}
          className="px-3 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-medium text-xs flex items-center justify-center gap-1.5 transition-all border border-white/10 active:scale-[0.98]"
          title="Position camera on balcony looking at panorama"
        >
          <span>🌅 Balcony View</span>
        </button>
      </div>

      {/* Primary Video Tour Button */}
      <button
        onClick={onOpenTour}
        className="w-full py-3 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all transform hover:scale-[1.01] active:scale-[0.99]"
      >
        <span>🎥 Step Inside: 3D Video & Virtual Tour</span>
      </button>

      {/* Orbit & Sunlight Controls Row */}
      <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleOrbit}
            className="text-white/70 hover:text-white flex items-center gap-1.5 transition-colors"
          >
            <span>{isOrbiting ? '⏸️' : '▶️'}</span>
          </button>
          <div className="flex items-center gap-1 bg-white/5 p-0.5 rounded-lg border border-white/5">
            {[0.5, 1, 2].map((spd) => (
              <button
                key={spd}
                onClick={() => setRealEstateOrbitSpeed(spd)}
                className="px-1.5 py-0.5 rounded text-[10px] text-white/60 hover:text-white hover:bg-white/10 font-mono transition-colors"
              >
                {spd}x
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => setShowSunControl(!showSunControl)}
          className={`flex items-center gap-1.5 transition-colors ${
            showSunControl ? 'text-amber-400 font-medium' : 'text-white/70 hover:text-white'
          }`}
        >
          <span>☀️ Sun & Shadows</span>
        </button>
      </div>

      {/* Sunlight & Shadow Simulator Slider */}
      {showSunControl && (
        <div className="p-3 bg-black/40 rounded-xl border border-white/10 space-y-2 animate-fade-in">
          <div className="flex items-center justify-between text-xs">
            <span className="text-white/60">Time of Day (Sun Angle):</span>
            <span className="font-mono text-amber-400 font-bold">{formatHour(sunHour)}</span>
          </div>
          <input
            type="range"
            min="6"
            max="21"
            step="0.25"
            value={sunHour}
            onChange={handleSunChange}
            className="w-full accent-amber-400 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-white/40">
            <span>🌅 6 AM Sunrise</span>
            <span>☀️ 12 PM Noon</span>
            <span>🌇 6 PM Sunset</span>
            <span>🌙 9 PM Dusk</span>
          </div>
        </div>
      )}
    </div>
  );
}
