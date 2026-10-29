import { useState, useMemo } from 'react';
import type { RealEstateProperty } from '../data/properties';

// ─── Types ────────────────────────────────────────────────────────────────────
type UnitStatus = 'available' | 'reserved' | 'sold' | 'not-released';
type UnitType = '1BHK' | '2BHK' | '3BHK' | 'Penthouse' | 'Studio';

interface Unit {
  id: string;
  number: string;
  type: UnitType;
  status: UnitStatus;
  sqft: number;
  price: string;
  view: string;
  floor: number;
}

interface UnitInventoryPanelProps {
  property: RealEstateProperty;
  onViewUnit: (unit: Unit) => void;
  onBalconyView: (floor: number) => void;
}

// ─── Status config ─────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<UnitStatus, { label: string; color: string; bg: string; dot: string }> = {
  available:    { label: 'Available',    color: 'text-emerald-400', bg: 'bg-emerald-500/20 hover:bg-emerald-500/35 border-emerald-500/40', dot: 'bg-emerald-400' },
  reserved:     { label: 'Reserved',     color: 'text-amber-400',   bg: 'bg-amber-500/20 hover:bg-amber-500/35 border-amber-500/40',     dot: 'bg-amber-400' },
  sold:         { label: 'Sold',         color: 'text-red-400',     bg: 'bg-red-500/15 border-red-500/30 cursor-not-allowed opacity-60', dot: 'bg-red-400' },
  'not-released': { label: 'Upcoming',  color: 'text-slate-400',   bg: 'bg-slate-500/10 border-slate-500/20 cursor-not-allowed opacity-40', dot: 'bg-slate-500' },
};

const UNIT_TYPES: UnitType[] = ['Studio', '1BHK', '2BHK', '3BHK', 'Penthouse'];

// ─── Generate deterministic fake inventory ─────────────────────────────────
function generateFloorUnits(property: RealEstateProperty, floor: number): Unit[] {
  const seed = (property.id.charCodeAt(0) + floor) % 7;
  const unitCount = floor > property.specs.beds + 10 ? 2 : 4;
  const types: UnitType[] = floor >= 30 ? ['3BHK', 'Penthouse'] : floor >= 20 ? ['2BHK', '3BHK'] : ['Studio', '1BHK', '2BHK'];
  const views = ['Sea View', 'City View', 'Garden View', 'Mountain View', 'Pool View', 'Park View'];
  const statuses: UnitStatus[] = ['available', 'reserved', 'sold', 'not-released'];

  return Array.from({ length: unitCount }, (_, i) => {
    const typeIdx = (seed + i) % types.length;
    const statusIdx = (seed * 3 + i * 2 + floor) % statuses.length;
    const type = types[typeIdx];
    const baseSqft = type === 'Studio' ? 450 : type === '1BHK' ? 680 : type === '2BHK' ? 1100 : type === '3BHK' ? 1650 : 3200;
    const basePrice = Math.round((property.price / 10) * (0.5 + (typeIdx * 0.3)) * (1 + floor * 0.01));
    return {
      id: `${property.id}-f${floor}-u${i + 1}`,
      number: `${floor}0${i + 1}`,
      type,
      status: statuses[statusIdx],
      sqft: baseSqft + (floor * 10),
      price: basePrice > 1_000_000
        ? `$${(basePrice / 1_000_000).toFixed(1)}M`
        : `$${(basePrice / 1000).toFixed(0)}K`,
      view: views[(seed + i + floor) % views.length],
      floor,
    };
  });
}

// ─── Component ────────────────────────────────────────────────────────────────
export function UnitInventoryPanel({ property, onViewUnit, onBalconyView }: UnitInventoryPanelProps) {
  const totalFloors = Math.max(5, Math.round(property.location.altitude / 4));
  const [selectedFloor, setSelectedFloor] = useState(Math.round(totalFloors / 2));
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [filterType, setFilterType] = useState<UnitType | 'All'>('All');

  const floorUnits = useMemo(() => generateFloorUnits(property, selectedFloor), [property, selectedFloor]);

  const filteredUnits = useMemo(() => floorUnits.filter(u =>
    filterType === 'All' || u.type === filterType
  ), [floorUnits, filterType]);

  // Stats
  const allUnits = useMemo(() => {
    const units: Unit[] = [];
    for (let f = 1; f <= totalFloors; f++) units.push(...generateFloorUnits(property, f));
    return units;
  }, [property, totalFloors]);

  const stats = useMemo(() => ({
    available: allUnits.filter(u => u.status === 'available').length,
    reserved: allUnits.filter(u => u.status === 'reserved').length,
    sold: allUnits.filter(u => u.status === 'sold').length,
    total: allUnits.length,
  }), [allUnits]);

  return (
    <div className="flex flex-col h-full bg-gray-950 text-white overflow-hidden">

      {/* Header */}
      <div className="px-5 pt-4 pb-3 border-b border-white/8">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Live Inventory</span>
            </div>
            <h3 className="text-base font-bold text-white">{property.title}</h3>
            <p className="text-[11px] text-white/50">{property.location.address}</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold font-mono text-white">{stats.available}</div>
            <div className="text-[10px] text-emerald-400">Units Available</div>
          </div>
        </div>

        {/* Stat Pills */}
        <div className="flex items-center gap-2 mt-3">
          {[
            { label: 'Available', val: stats.available, color: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30' },
            { label: 'Reserved',  val: stats.reserved,  color: 'text-amber-400 bg-amber-500/15 border-amber-500/30' },
            { label: 'Sold',      val: stats.sold,      color: 'text-red-400 bg-red-500/15 border-red-500/30' },
            { label: 'Total',     val: stats.total,     color: 'text-blue-400 bg-blue-500/15 border-blue-500/30' },
          ].map(s => (
            <div key={s.label} className={`flex-1 text-center px-2 py-1.5 rounded-lg border text-[10px] font-semibold ${s.color}`}>
              <div className="text-base font-bold font-mono">{s.val}</div>
              <div className="opacity-70">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Body: Floor Selector + Unit Grid */}
      <div className="flex flex-1 overflow-hidden">

        {/* Floor Selector Column */}
        <div className="w-16 border-r border-white/8 overflow-y-auto flex flex-col-reverse py-2 gap-0.5 scrollbar-hide">
          {Array.from({ length: totalFloors }, (_, i) => {
            const f = i + 1;
            const fUnits = generateFloorUnits(property, f);
            const hasAvailable = fUnits.some(u => u.status === 'available');
            const allSold = fUnits.every(u => u.status === 'sold');
            return (
              <button
                key={f}
                onClick={() => { setSelectedFloor(f); setSelectedUnit(null); }}
                className={`mx-1.5 h-7 rounded-md text-[10px] font-bold transition-all flex items-center justify-between px-1.5 ${
                  selectedFloor === f
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                    : hasAvailable
                    ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20'
                    : allSold
                    ? 'bg-red-500/10 text-red-400/50 border border-red-500/10'
                    : 'bg-white/5 text-white/50 hover:bg-white/10'
                }`}
              >
                <span>{f}</span>
                {hasAvailable && selectedFloor !== f && <span className="w-1 h-1 rounded-full bg-emerald-400" />}
              </button>
            );
          })}
        </div>

        {/* Unit Grid */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Floor Header */}
          <div className="px-3 py-2 border-b border-white/8 flex items-center justify-between bg-blue-600/10">
            <div>
              <span className="text-xs font-bold text-white">Floor {selectedFloor}</span>
              <span className="text-[10px] text-white/40 ml-2">
                {filteredUnits.filter(u => u.status === 'available').length} available
              </span>
            </div>
            <button
              onClick={() => onBalconyView(selectedFloor)}
              className="px-2.5 py-1 rounded-lg bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/30 text-[10px] font-semibold text-blue-300 transition-colors flex items-center gap-1"
            >
              🪟 Balcony View
            </button>
          </div>

          {/* Filters */}
          <div className="px-3 py-2 border-b border-white/5 flex items-center gap-2 overflow-x-auto">
            <div className="flex items-center gap-1">
              {(['All', ...UNIT_TYPES] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setFilterType(t as UnitType | 'All')}
                  className={`px-2 py-0.5 rounded text-[10px] font-medium whitespace-nowrap transition-colors ${
                    filterType === t
                      ? 'bg-white/15 text-white'
                      : 'text-white/40 hover:text-white/70'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Units List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {filteredUnits.map(unit => {
              const cfg = STATUS_CONFIG[unit.status];
              const isSelected = selectedUnit?.id === unit.id;
              return (
                <div key={unit.id}>
                  <button
                    onClick={() => {
                      if (unit.status === 'sold' || unit.status === 'not-released') return;
                      setSelectedUnit(isSelected ? null : unit);
                      onViewUnit(unit);
                    }}
                    className={`w-full p-3 rounded-xl border transition-all text-left ${cfg.bg} ${
                      isSelected ? 'ring-1 ring-blue-400' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                        <span className="text-sm font-bold text-white">Unit {unit.number}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-white/60 font-medium">{unit.type}</span>
                      </div>
                      <span className={`text-xs font-bold ${cfg.color}`}>{cfg.label}</span>
                    </div>
                    <div className="flex items-center justify-between mt-2 text-[11px] text-white/50">
                      <span>{unit.sqft.toLocaleString()} sq ft</span>
                      <span className="text-blue-300 font-mono font-semibold">{unit.price}</span>
                      <span>🌅 {unit.view}</span>
                    </div>
                  </button>

                  {/* Expanded Unit Detail */}
                  {isSelected && (
                    <div className="mx-1 p-3 bg-blue-950/50 border border-blue-500/20 rounded-b-xl -mt-1 space-y-2 animate-fade-in">
                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div className="space-y-1">
                          <div className="text-white/40">Floor</div>
                          <div className="text-white font-semibold">{unit.floor} of {totalFloors}</div>
                        </div>
                        <div className="space-y-1">
                          <div className="text-white/40">View Direction</div>
                          <div className="text-white font-semibold">{unit.view}</div>
                        </div>
                        <div className="space-y-1">
                          <div className="text-white/40">Price</div>
                          <div className="text-blue-300 font-bold">{unit.price}</div>
                        </div>
                        <div className="space-y-1">
                          <div className="text-white/40">Size</div>
                          <div className="text-white font-semibold">{unit.sqft.toLocaleString()} sqft</div>
                        </div>
                      </div>
                      <div className="flex gap-2 pt-1">
                        <button
                          onClick={() => onBalconyView(unit.floor)}
                          className="flex-1 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-[11px] font-semibold text-white/80 transition-colors"
                        >
                          🪟 Balcony View
                        </button>
                        <button
                          onClick={() => alert(`Enquiry sent for Unit ${unit.number}!`)}
                          className="flex-1 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-[11px] font-bold text-white transition-colors"
                        >
                          Book Now
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {filteredUnits.length === 0 && (
              <div className="text-center py-8 text-white/30 text-xs">
                No units match the current filter
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="px-4 py-2 border-t border-white/8 flex items-center justify-center gap-4">
        {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
          <div key={key} className="flex items-center gap-1.5">
            <div className={`w-2 h-2 rounded-full ${cfg.dot}`} />
            <span className={`text-[10px] ${cfg.color}`}>{cfg.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
