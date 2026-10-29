import { useState, useCallback } from 'react';
import type { RealEstateProperty } from '../data/properties';
import { UnitInventoryPanel } from './UnitInventoryPanel';
import { SunSimulator } from './SunSimulator';
import { AmenitiesOverlay } from './AmenitiesOverlay';

type RealEstate3DTab = 'inventory' | 'sun' | 'amenities';

interface RealEstate3DPanelProps {
  property: RealEstateProperty;
  onBalconyView: (floor: number) => void;
  onTimeChange: (hour: number) => void;
  onClose: () => void;
}

const TABS: { id: RealEstate3DTab; icon: string; label: string; badge?: string }[] = [
  { id: 'inventory', icon: '🏢', label: 'Inventory' },
  { id: 'sun',       icon: '☀️', label: 'Sun Path' },
  { id: 'amenities', icon: '📍', label: 'Location' },
];

export function RealEstate3DPanel({ property, onBalconyView, onTimeChange, onClose }: RealEstate3DPanelProps) {
  const [activeTab, setActiveTab] = useState<RealEstate3DTab>('inventory');

  const handleViewUnit = useCallback(() => {
    // Future: could trigger a Cesium camera focus on the unit
  }, []);

  return (
    <div className="flex flex-col h-full bg-gray-950/95 backdrop-blur-xl border-l border-white/10 text-white overflow-hidden">

      {/* Panel Header */}
      <div className="px-4 py-3 border-b border-white/10 bg-gradient-to-r from-indigo-950/60 to-violet-950/40 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2.5">
          {/* realestate3d Logo Mark */}
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="6" stroke="white" strokeWidth="1.5" />
              <path d="M8 4 L8 12 M4 8 L12 8" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
              <circle cx="8" cy="8" r="2" fill="white"/>
            </svg>
          </div>
          <div>
            <div className="text-sm font-bold text-white tracking-wide">realestate3d</div>
            <div className="text-[9px] text-white/40 uppercase tracking-widest">Immersive Real Estate</div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors"
          title="Close realestate3d Panel"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      {/* Tab Bar */}
      <div className="flex border-b border-white/8 flex-shrink-0">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-3 flex flex-col items-center gap-1 transition-all relative ${
              activeTab === tab.id
                ? 'text-white bg-white/5'
                : 'text-white/40 hover:text-white/70 hover:bg-white/3'
            }`}
          >
            <span className="text-base">{tab.icon}</span>
            <span className="text-[9px] font-semibold uppercase tracking-wider">{tab.label}</span>
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-violet-500" />
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'inventory' && (
          <UnitInventoryPanel
            property={property}
            onViewUnit={handleViewUnit}
            onBalconyView={onBalconyView}
          />
        )}
        {activeTab === 'sun' && (
          <div className="flex items-start justify-center p-4 overflow-y-auto h-full">
            <SunSimulator onTimeChange={onTimeChange} />
          </div>
        )}
        {activeTab === 'amenities' && (
          <AmenitiesOverlay property={property} />
        )}
      </div>

      {/* Bottom Branding */}
      <div className="px-4 py-2 border-t border-white/8 flex items-center justify-between flex-shrink-0">
        <span className="text-[9px] text-white/20 uppercase tracking-widest">Powered by realestate3d × Cesium</span>
        <div className="flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[9px] text-emerald-400">Live</span>
        </div>
      </div>
    </div>
  );
}
