import { useState } from 'react';
import type { RealEstateProperty } from '../data/properties';
import { Photo3DWalkthrough } from './Photo3DWalkthrough';

interface VirtualTourModalProps {
  property: RealEstateProperty;
  onClose: () => void;
}

export function VirtualTourModal({ property, onClose }: VirtualTourModalProps) {
  const [activeTab, setActiveTab] = useState<'video' | 'matterport' | 'floorplan' | 'photo3d'>('video');
  const [activeRoom, setActiveRoom] = useState<string>('terrace');

  const rooms = [
    { id: 'terrace', label: 'Panoramic Sky Terrace', time: '0:15', desc: 'Private heated infinity pool, sunken fire pit & 360° unobstructed horizon.' },
    { id: 'living', label: 'Grand Living Salon', time: '1:02', desc: '14ft ceiling clearance, floor-to-ceiling acoustic glass & bespoke Italian marble.' },
    { id: 'master', label: 'Presidential Master Suite', time: '1:45', desc: 'Dual walk-in dressing rooms, private sauna, and morning sun exposure.' },
    { id: 'kitchen', label: 'Gourmet Chef Kitchen', time: '2:30', desc: 'Custom Boffi cabinetry, Sub-Zero & Gaggenau culinary suite, sommelier wine wall.' },
    { id: 'wellness', label: 'Private Spa & Cinema', time: '3:10', desc: 'Heated vitality pool, Finnish sauna, steam room and Dolby Atmos private theater.' },
  ];

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-8 bg-black/80 backdrop-blur-xl animate-fade-in pointer-events-auto">
      <div className="relative w-full max-w-6xl h-[90vh] bg-gray-950/90 border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-white">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/5">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{property.flag}</span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-wide">{property.title}</h2>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 font-mono">
                  {property.priceFormatted}
                </span>
              </div>
              <p className="text-xs text-white/50">{property.location.address}</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/5">
            <button
              onClick={() => setActiveTab('video')}
              className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'video'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              🎥 4K 3D Walkthrough
            </button>
            <button
              onClick={() => setActiveTab('matterport')}
              className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'matterport'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              🌐 Interactive 3D Twin
            </button>
            <button
              onClick={() => setActiveTab('floorplan')}
              className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'floorplan'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              📐 Architectural Plan
            </button>
            <button
              onClick={() => setActiveTab('photo3d')}
              className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                activeTab === 'photo3d'
                  ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/30'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              📸 My Photos → 3D
              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-violet-400/20 text-violet-300 border border-violet-400/30 font-bold">NEW</span>
            </button>
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-colors"
            title="Close Tour"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-hidden relative flex flex-col md:flex-row">
          
          {/* Main Media Viewer */}
          <div className="flex-1 h-full bg-black relative flex flex-col items-center justify-center overflow-hidden">
            {activeTab === 'video' && (
              <div className="relative w-full h-full flex flex-col">
                <iframe
                  className="w-full h-full border-0"
                  src={property.videoTourUrl}
                  title="3D Video Walkthrough"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
                
                {/* Room Hotspot Bar */}
                <div className="absolute bottom-4 left-4 right-4 bg-gray-950/80 backdrop-blur-md p-3 rounded-xl border border-white/10 flex items-center justify-between gap-2 overflow-x-auto">
                  <div className="text-xs font-semibold text-white/60 uppercase tracking-wider pl-1">
                    Jump to Space:
                  </div>
                  <div className="flex items-center gap-2">
                    {rooms.map((room) => (
                      <button
                        key={room.id}
                        onClick={() => setActiveRoom(room.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs whitespace-nowrap transition-all flex items-center gap-1.5 ${
                          activeRoom === room.id
                            ? 'bg-blue-500 text-white font-medium shadow-md shadow-blue-500/30'
                            : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        <span>{room.label}</span>
                        <span className="text-[10px] opacity-60 font-mono">({room.time})</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'matterport' && (
              <div className="w-full h-full relative bg-gray-900 flex flex-col items-center justify-center p-8 text-center">
                <div className="max-w-md space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center mx-auto text-3xl">
                    🌐
                  </div>
                  <h3 className="text-xl font-bold text-white">Spatial 3D Digital Twin Viewer</h3>
                  <p className="text-sm text-white/60 leading-relaxed">
                    Interactive dollhouse spatial scanning connected directly to Matterport & Gaussian Splatting pipeline.
                  </p>
                  <div className="p-4 bg-white/5 border border-white/10 rounded-xl text-left space-y-2 text-xs">
                    <div className="flex justify-between text-white/80">
                      <span>LiDAR Spatial Accuracy:</span>
                      <span className="font-mono text-green-400">99.8% (&plusmn;4mm)</span>
                    </div>
                    <div className="flex justify-between text-white/80">
                      <span>Interior Scan Points:</span>
                      <span className="font-mono text-blue-400">142 Navigational Panoramas</span>
                    </div>
                    <div className="flex justify-between text-white/80">
                      <span>VR Ready:</span>
                      <span className="font-mono text-purple-400">Apple Vision Pro / Meta Quest</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab('video')}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 rounded-xl text-sm font-semibold transition-colors"
                  >
                    Watch Full 4K Walkthrough Video Instead
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'photo3d' && (
              <Photo3DWalkthrough />
            )}

            {activeTab === 'floorplan' && (
              <div className="w-full h-full p-8 flex flex-col items-center justify-center overflow-auto bg-gray-950">
                <div className="max-w-3xl w-full bg-white/5 p-6 rounded-2xl border border-white/10 space-y-6">
                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <div>
                      <h4 className="text-lg font-bold text-white">Architectural Elevation & Schematics</h4>
                      <p className="text-xs text-white/50">{property.specs.propertyType} • Built in {property.specs.yearBuilt}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-mono font-bold text-blue-400">{property.specs.sqft.toLocaleString()} SQ FT</div>
                      <div className="text-xs text-white/40">{property.specs.sqm.toLocaleString()} M² LIVING SPACE</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                    <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                      <div className="text-xs text-white/40">Bedrooms</div>
                      <div className="text-xl font-bold text-white">{property.specs.beds} En-Suite</div>
                    </div>
                    <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                      <div className="text-xs text-white/40">Bathrooms</div>
                      <div className="text-xl font-bold text-white">{property.specs.baths} Marble</div>
                    </div>
                    <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                      <div className="text-xs text-white/40">Building Height</div>
                      <div className="text-xl font-bold text-white">{property.location.altitude}m</div>
                    </div>
                    <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                      <div className="text-xs text-white/40">Exterior Exposure</div>
                      <div className="text-xl font-bold text-white">360° Unobstructed</div>
                    </div>
                  </div>

                  <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl space-y-2">
                    <div className="text-xs font-semibold text-blue-400 uppercase tracking-wider">
                      Selected Space Highlight: {rooms.find(r => r.id === activeRoom)?.label}
                    </div>
                    <p className="text-xs text-white/70">
                      {rooms.find(r => r.id === activeRoom)?.desc}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar: Key Specs & Property Overview */}
          <div className="w-full md:w-80 border-t md:border-t-0 md:border-l border-white/10 p-6 flex flex-col justify-between bg-gray-900/40 backdrop-blur-md overflow-y-auto">
            <div className="space-y-6">
              <div>
                <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Global Trophy Asset</span>
                <h3 className="text-xl font-bold text-white mt-1">{property.title}</h3>
                <p className="text-xs text-white/60 mt-1 leading-relaxed">{property.tagline}</p>
              </div>

              {/* Price & Cadastre */}
              <div className="p-3 bg-white/5 rounded-xl border border-white/5 space-y-1">
                <div className="text-[10px] text-white/40 uppercase">Asking Price</div>
                <div className="text-2xl font-bold text-white font-mono">{property.priceFormatted}</div>
                <div className="text-[10px] text-emerald-400 font-medium">✓ Verified Exclusive Listing</div>
              </div>

              {/* Curated Amenities */}
              <div className="space-y-2">
                <div className="text-xs font-semibold text-white/70 uppercase tracking-wider">
                  Signature Amenities
                </div>
                <ul className="space-y-2">
                  {property.amenities.map((amenity, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-white/80">
                      <span className="text-blue-400 mt-0.5">✦</span>
                      <span>{amenity}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Inquire Button */}
            <div className="pt-6 border-t border-white/10 space-y-2">
              <button
                onClick={() => alert(`Private Brokerage Dossier requested for ${property.title}. Contacting lead advisory team.`)}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-xl text-xs font-bold text-white tracking-wider uppercase transition-all shadow-lg shadow-blue-500/20 active:scale-[0.98]"
              >
                Request Private Dossier
              </button>
              <p className="text-[10px] text-white/40 text-center">
                Confidential NDA required for private viewing
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
