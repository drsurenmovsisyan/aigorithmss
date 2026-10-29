import { useState, useEffect, useCallback } from 'react';
import { LUXURY_PROPERTIES, type RealEstateProperty } from '../features/realestate/data/properties';
import { MarketSelector } from '../features/realestate/components/MarketSelector';
import { PropertyDetailCard } from '../features/realestate/components/PropertyDetailCard';
import { VirtualTourModal } from '../features/realestate/components/VirtualTourModal';
import { RealEstate3DPanel } from '../features/realestate/components/RealEstate3DPanel';
import { useGameMethod } from '../hooks/useGameMethod';

export function RealEstateModeUI() {
  const [selectedProperty, setSelectedProperty] = useState<RealEstateProperty>(LUXURY_PROPERTIES[0]);
  const [isTourModalOpen, setIsTourModalOpen] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [balconyFloor, setBalconyFloor] = useState<number | null>(null);
  const { flyToRealEstateProperty, setRealEstateOrbitDistance, getRealEstateController, flyToBalconyView, setRealEstateSunHour } = useGameMethod();

  // Listen to pin clicks from Cesium 3D scene
  useEffect(() => {
    const controller = getRealEstateController();
    if (controller) {
      controller.setOnPropertySelect((prop) => {
        setSelectedProperty(prop);
      });
    }
  }, [getRealEstateController]);

  const handleSelectProperty = (prop: RealEstateProperty) => {
    setSelectedProperty(prop);
    flyToRealEstateProperty(prop, true);
  };

  const handleBalconyView = useCallback((floor: number) => {
    setBalconyFloor(floor);
    // Fly camera to balcony height of this floor
    try {
      if (typeof flyToBalconyView === 'function') {
        flyToBalconyView(selectedProperty, floor);
      } else {
        // Fallback: orbit at floor altitude
        flyToRealEstateProperty(selectedProperty, false);
      }
    } catch {
      flyToRealEstateProperty(selectedProperty, false);
    }
  }, [selectedProperty, flyToBalconyView, flyToRealEstateProperty]);

  const handleTimeChange = useCallback((hour: number) => {
    try { setRealEstateSunHour(hour); } catch { /* ignore */ }
  }, [setRealEstateSunHour]);

  return (
    <>
      {/* Top Bar: Prime Markets Selector */}
      <div className="fixed top-6 left-6 right-6 z-40 flex items-center justify-between pointer-events-none">
        <MarketSelector
          selectedProperty={selectedProperty}
          onSelectProperty={handleSelectProperty}
        />

        <div className="flex items-center gap-3 pointer-events-auto">
          {/* realestate3d Toggle Button */}
          <button
            onClick={() => setIsPanelOpen(prev => !prev)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border shadow-xl transition-all ${
              isPanelOpen
                ? 'bg-gradient-to-r from-blue-600 to-violet-600 border-blue-500/50 text-white shadow-blue-500/30'
                : 'bg-gray-950/80 backdrop-blur-md border-white/10 text-white hover:bg-white/10'
            }`}
            title="Toggle realestate3d Panel"
          >
            {/* realestate3d Logo */}
            <div className={`w-5 h-5 rounded-md flex items-center justify-center ${
              isPanelOpen ? 'bg-white/20' : 'bg-gradient-to-br from-blue-500 to-violet-600'
            }`}>
              <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="6" stroke="white" strokeWidth="1.5"/>
                <path d="M8 4 L8 12 M4 8 L12 8" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                <circle cx="8" cy="8" r="2" fill="white"/>
              </svg>
            </div>
            <span className="text-xs font-bold tracking-wide">realestate3d</span>
            <span className="text-[9px] opacity-60">{isPanelOpen ? '✕' : '▶'}</span>
          </button>

          {/* Real Estate Branding Badge */}
          <div className="glass-panel px-4 py-2 border border-white/10 shadow-xl hidden md:flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-white">
              Cesium 3D Twin • Global Prime Real Estate
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Left: Active Property Card */}
      <div className={`fixed bottom-6 z-40 transition-all duration-300 ${isPanelOpen ? 'left-6' : 'left-6'}`}>
        <PropertyDetailCard
          property={selectedProperty}
          onOpenTour={() => setIsTourModalOpen(true)}
        />
      </div>

      {/* Bottom Right: Drone Orbit Zoom / Altitude Controls */}
      <div className={`fixed bottom-24 z-40 glass-panel p-2.5 flex flex-col gap-2 pointer-events-auto border border-white/10 shadow-xl transition-all duration-300 ${
        isPanelOpen ? 'right-[332px]' : 'right-6'
      }`}>
        <div className="text-[10px] font-bold text-white/50 uppercase tracking-widest text-center px-1">
          Drone Orbit
        </div>
        <button
          onClick={() => setRealEstateOrbitDistance(-30)}
          className="p-2 rounded-lg bg-white/5 hover:bg-white/15 text-white text-xs font-mono transition-colors flex items-center justify-center"
          title="Zoom In Orbit"
        >
          🔍+ In
        </button>
        <button
          onClick={() => setRealEstateOrbitDistance(30)}
          className="p-2 rounded-lg bg-white/5 hover:bg-white/15 text-white text-xs font-mono transition-colors flex items-center justify-center"
          title="Zoom Out Orbit"
        >
          🔍- Out
        </button>
      </div>

      {/* Balcony Floor Indicator */}
      {balconyFloor !== null && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 bg-blue-600/90 backdrop-blur-md border border-blue-400/40 rounded-2xl shadow-2xl shadow-blue-600/30 pointer-events-auto">
          <span className="text-lg">🪟</span>
          <div>
            <div className="text-sm font-bold text-white">Balcony View — Floor {balconyFloor}</div>
            <div className="text-[10px] text-blue-200">{selectedProperty.title}</div>
          </div>
          <button
            onClick={() => { setBalconyFloor(null); flyToRealEstateProperty(selectedProperty, true); }}
            className="ml-2 p-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-white text-xs transition-colors"
          >
            ✕ Exit
          </button>
        </div>
      )}

      {/* 3D Video & Virtual Tour Modal */}
      {isTourModalOpen && (
        <VirtualTourModal
          property={selectedProperty}
          onClose={() => setIsTourModalOpen(false)}
        />
      )}

      {/* realestate3d Side Panel */}
      {isPanelOpen && (
        <div
          className="fixed top-0 right-0 bottom-0 z-40 w-80 shadow-2xl pointer-events-auto"
          style={{ top: 0 }}
        >
          <RealEstate3DPanel
            property={selectedProperty}
            onBalconyView={handleBalconyView}
            onTimeChange={handleTimeChange}
            onClose={() => setIsPanelOpen(false)}
          />
        </div>
      )}
    </>
  );
}
