import { useRef, useEffect } from 'react';
import { LUXURY_PROPERTIES, type RealEstateProperty } from '../data/properties';

interface MarketSelectorProps {
  selectedProperty: RealEstateProperty;
  onSelectProperty: (property: RealEstateProperty) => void;
}

export function MarketSelector({ selectedProperty, onSelectProperty }: MarketSelectorProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll the active market button into view smoothly
  useEffect(() => {
    if (scrollContainerRef.current) {
      const activeBtn = scrollContainerRef.current.querySelector<HTMLElement>('[data-active="true"]');
      if (activeBtn) {
        activeBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [selectedProperty.id]);

  const handleScroll = (delta: number) => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: delta, behavior: 'smooth' });
    }
  };

  return (
    <div className="glass-panel p-2 flex items-center gap-2 max-w-5xl pointer-events-auto border border-white/10 shadow-2xl relative">
      <div className="flex items-center gap-1.5 px-3 py-1.5 border-r border-white/10 text-xs font-bold text-white/80 shrink-0 uppercase tracking-wider">
        <span>💎 Prime Markets</span>
        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-mono">
          {LUXURY_PROPERTIES.length}
        </span>
      </div>

      {/* Left scroll chevron */}
      <button
        onClick={() => handleScroll(-200)}
        className="p-1 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors shrink-0 hidden sm:flex items-center justify-center"
        title="Scroll left"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Markets list */}
      <div
        ref={scrollContainerRef}
        className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 scroll-smooth"
      >
        {LUXURY_PROPERTIES.map((prop) => {
          const isSelected = selectedProperty.id === prop.id;
          return (
            <button
              key={prop.id}
              data-active={isSelected}
              onClick={() => onSelectProperty(prop)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all flex items-center gap-2 ${
                isSelected
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 border border-blue-400/40 ring-1 ring-blue-400/50 scale-[1.02]'
                  : 'bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/5'
              }`}
            >
              <span className="text-sm">{prop.flag}</span>
              <span className="font-semibold">{prop.city}</span>
              <span className={`text-[11px] font-mono ${isSelected ? 'text-blue-100 font-semibold' : 'text-white/40'}`}>
                {prop.priceFormatted}
              </span>
            </button>
          );
        })}
      </div>

      {/* Right scroll chevron */}
      <button
        onClick={() => handleScroll(200)}
        className="p-1 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors shrink-0 hidden sm:flex items-center justify-center"
        title="Scroll right"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}
