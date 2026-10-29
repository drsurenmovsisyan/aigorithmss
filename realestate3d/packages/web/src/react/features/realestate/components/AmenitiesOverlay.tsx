import { useState } from 'react';
import type { RealEstateProperty } from '../data/properties';

interface AmenitiesOverlayProps {
  property: RealEstateProperty;
}

type AmenityCategory = 'All' | 'Education' | 'Healthcare' | 'Dining' | 'Transit' | 'Shopping' | 'Recreation';

interface Amenity {
  id: string;
  name: string;
  category: AmenityCategory;
  icon: string;
  distanceKm: number;
  walkMins: number;
  driveMins: number;
  rating: number;
}

const CATEGORY_CONFIG: Record<Exclude<AmenityCategory, 'All'>, { color: string; bg: string; icon: string }> = {
  Education:   { color: 'text-blue-400',   bg: 'bg-blue-500/15 border-blue-500/25',   icon: '🎓' },
  Healthcare:  { color: 'text-red-400',    bg: 'bg-red-500/15 border-red-500/25',     icon: '🏥' },
  Dining:      { color: 'text-orange-400', bg: 'bg-orange-500/15 border-orange-500/25', icon: '🍽️' },
  Transit:     { color: 'text-green-400',  bg: 'bg-green-500/15 border-green-500/25', icon: '🚇' },
  Shopping:    { color: 'text-purple-400', bg: 'bg-purple-500/15 border-purple-500/25', icon: '🛍️' },
  Recreation:  { color: 'text-cyan-400',   bg: 'bg-cyan-500/15 border-cyan-500/25',   icon: '🏖️' },
};

// Generate context-aware amenities per property location
function getAmenities(property: RealEstateProperty): Amenity[] {
  const city = property.city;
  const baseAmenities: Amenity[] = [
    // Education
    { id: 'edu1', name: `${city} International School`, category: 'Education', icon: '🏫', distanceKm: 0.8, walkMins: 10, driveMins: 3, rating: 4.8 },
    { id: 'edu2', name: `${city} University Campus`, category: 'Education', icon: '🎓', distanceKm: 2.1, walkMins: 26, driveMins: 7, rating: 4.6 },
    // Healthcare
    { id: 'hlt1', name: `${city} Medical Center`, category: 'Healthcare', icon: '🏥', distanceKm: 1.2, walkMins: 15, driveMins: 4, rating: 4.7 },
    { id: 'hlt2', name: `Prime Wellness Clinic`, category: 'Healthcare', icon: '💊', distanceKm: 0.4, walkMins: 5, driveMins: 2, rating: 4.5 },
    // Dining
    { id: 'din1', name: `Michelin Star Restaurant Row`, category: 'Dining', icon: '⭐', distanceKm: 0.3, walkMins: 4, driveMins: 2, rating: 4.9 },
    { id: 'din2', name: `${city} Waterfront Dining`, category: 'Dining', icon: '🍽️', distanceKm: 0.6, walkMins: 8, driveMins: 3, rating: 4.7 },
    { id: 'din3', name: `Rooftop Café & Lounge`, category: 'Dining', icon: '☕', distanceKm: 0.2, walkMins: 3, driveMins: 1, rating: 4.4 },
    // Transit
    { id: 'trn1', name: `Metro / Subway Station`, category: 'Transit', icon: '🚇', distanceKm: 0.5, walkMins: 6, driveMins: 2, rating: 4.3 },
    { id: 'trn2', name: `International Airport`, category: 'Transit', icon: '✈️', distanceKm: 18, walkMins: 220, driveMins: 25, rating: 4.6 },
    { id: 'trn3', name: `Ferry / Water Taxi Terminal`, category: 'Transit', icon: '⛴️', distanceKm: 1.0, walkMins: 12, driveMins: 4, rating: 4.2 },
    // Shopping
    { id: 'shp1', name: `${city} Luxury Mall`, category: 'Shopping', icon: '🛍️', distanceKm: 1.5, walkMins: 18, driveMins: 5, rating: 4.8 },
    { id: 'shp2', name: `Designer Boutique Strip`, category: 'Shopping', icon: '👜', distanceKm: 0.4, walkMins: 5, driveMins: 2, rating: 4.6 },
    // Recreation
    { id: 'rec1', name: `${city} Beachfront / Park`, category: 'Recreation', icon: '🏖️', distanceKm: 0.3, walkMins: 4, driveMins: 2, rating: 4.9 },
    { id: 'rec2', name: `Private Golf & Country Club`, category: 'Recreation', icon: '⛳', distanceKm: 4.2, walkMins: 52, driveMins: 10, rating: 4.7 },
    { id: 'rec3', name: `Marina & Yacht Club`, category: 'Recreation', icon: '⛵', distanceKm: 0.8, walkMins: 10, driveMins: 3, rating: 4.8 },
  ];
  return baseAmenities;
}

function ScoreBar({ value }: { value: number }) {
  const pct = ((value - 3) / 2) * 100;
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-emerald-500 to-emerald-300 rounded-full"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-[10px] font-mono text-emerald-400 w-6">{value.toFixed(1)}</span>
    </div>
  );
}

export function AmenitiesOverlay({ property }: AmenitiesOverlayProps) {
  const [activeCategory, setActiveCategory] = useState<AmenityCategory>('All');
  const [sortBy, setSortBy] = useState<'distance' | 'rating'>('distance');
  const [expanded, setExpanded] = useState<string | null>(null);

  const amenities = getAmenities(property);
  const filtered = amenities
    .filter(a => activeCategory === 'All' || a.category === activeCategory)
    .sort((a, b) => sortBy === 'distance' ? a.distanceKm - b.distanceKm : b.rating - a.rating);

  // Connectivity score
  const scoreByCategory = (cat: Exclude<AmenityCategory, 'All'>) => {
    const items = amenities.filter(a => a.category === cat);
    const avgDist = items.reduce((s, a) => s + a.distanceKm, 0) / items.length;
    return Math.min(100, Math.round(100 - avgDist * 8));
  };

  const overallScore = Math.round(
    Object.keys(CATEGORY_CONFIG).reduce((s, cat) => s + scoreByCategory(cat as Exclude<AmenityCategory, 'All'>), 0) /
    Object.keys(CATEGORY_CONFIG).length
  );

  return (
    <div className="flex flex-col h-full bg-gray-950 text-white overflow-hidden">

      {/* Header */}
      <div className="px-5 pt-4 pb-3 border-b border-white/8">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest">📍 Location Score</span>
            </div>
            <h3 className="text-base font-bold text-white">Connectivity Analysis</h3>
            <p className="text-[11px] text-white/50">{property.location.address}</p>
          </div>
          <div className="relative w-14 h-14">
            <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="#ffffff10" strokeWidth="3" />
              <circle
                cx="18" cy="18" r="15.9" fill="none"
                stroke="url(#scoreGrad)" strokeWidth="3" strokeLinecap="round"
                strokeDasharray={`${overallScore} 100`}
              />
              <defs>
                <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#22d3ee" />
                  <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center rotate-0">
              <span className="text-sm font-bold text-white font-mono">{overallScore}</span>
              <span className="text-[8px] text-white/40">/100</span>
            </div>
          </div>
        </div>

        {/* Category Scores */}
        <div className="space-y-1.5">
          {(Object.entries(CATEGORY_CONFIG) as [Exclude<AmenityCategory, 'All'>, typeof CATEGORY_CONFIG[keyof typeof CATEGORY_CONFIG]][]).map(([cat, cfg]) => (
            <div key={cat} className="flex items-center gap-2">
              <span className="w-4 text-center">{cfg.icon}</span>
              <span className="w-20 text-[10px] text-white/50">{cat}</span>
              <div className="flex-1">
                <ScoreBar value={3 + (scoreByCategory(cat) / 50)} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Category Filter */}
      <div className="px-3 py-2 border-b border-white/5 flex items-center gap-1.5 overflow-x-auto">
        {(['All', ...Object.keys(CATEGORY_CONFIG)] as AmenityCategory[]).map(cat => {
          const cfg = cat !== 'All' ? CATEGORY_CONFIG[cat as Exclude<AmenityCategory, 'All'>] : null;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-medium whitespace-nowrap transition-all border ${
                activeCategory === cat
                  ? cfg
                    ? `${cfg.bg} ${cfg.color}`
                    : 'bg-white/15 text-white border-white/20'
                  : 'bg-transparent text-white/40 border-transparent hover:text-white/70'
              }`}
            >
              {cfg && <span>{cfg.icon}</span>}
              {cat}
            </button>
          );
        })}
      </div>

      {/* Sort */}
      <div className="px-3 py-1.5 border-b border-white/5 flex items-center gap-2">
        <span className="text-[10px] text-white/40">Sort:</span>
        {(['distance', 'rating'] as const).map(s => (
          <button
            key={s}
            onClick={() => setSortBy(s)}
            className={`text-[10px] px-2 py-0.5 rounded transition-colors ${
              sortBy === s ? 'bg-white/15 text-white' : 'text-white/40 hover:text-white/60'
            }`}
          >
            {s === 'distance' ? '📏 Nearest' : '⭐ Highest Rated'}
          </button>
        ))}
      </div>

      {/* Amenities List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {filtered.map(amenity => {
          const cfg = CATEGORY_CONFIG[amenity.category as Exclude<AmenityCategory, 'All'>];
          const isExpanded = expanded === amenity.id;
          return (
            <div key={amenity.id}>
              <button
                onClick={() => setExpanded(isExpanded ? null : amenity.id)}
                className={`w-full p-3 rounded-xl border text-left transition-all ${cfg.bg} ${
                  isExpanded ? 'ring-1 ring-white/20' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{amenity.icon}</span>
                    <div>
                      <div className="text-xs font-semibold text-white">{amenity.name}</div>
                      <div className={`text-[10px] ${cfg.color}`}>{amenity.category}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold text-white">{amenity.distanceKm} km</div>
                    <div className="text-[10px] text-white/40">{amenity.walkMins} min walk</div>
                  </div>
                </div>
              </button>

              {isExpanded && (
                <div className="mx-1 -mt-1 px-3 py-3 bg-white/5 border border-white/10 rounded-b-xl space-y-2">
                  <div className="grid grid-cols-3 gap-2 text-[10px]">
                    <div className="text-center p-2 bg-white/5 rounded-lg">
                      <div className="text-base">🚶</div>
                      <div className="font-bold text-white">{amenity.walkMins} min</div>
                      <div className="text-white/40">Walk</div>
                    </div>
                    <div className="text-center p-2 bg-white/5 rounded-lg">
                      <div className="text-base">🚗</div>
                      <div className="font-bold text-white">{amenity.driveMins} min</div>
                      <div className="text-white/40">Drive</div>
                    </div>
                    <div className="text-center p-2 bg-white/5 rounded-lg">
                      <div className="text-base">⭐</div>
                      <div className="font-bold text-white">{amenity.rating}</div>
                      <div className="text-white/40">Rating</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
