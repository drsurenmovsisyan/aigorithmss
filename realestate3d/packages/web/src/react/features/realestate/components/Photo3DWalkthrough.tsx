import { useState, useRef, useCallback, useEffect } from 'react';

interface UploadedPhoto {
  id: string;
  url: string;
  name: string;
  label: string;
}

type WalkthroughState = 'idle' | 'processing' | 'touring';

const ROOM_LABELS = [
  'Entrance Foyer',
  'Grand Living Room',
  'Master Bedroom',
  'Chef Kitchen',
  'Dining Room',
  'Primary Bathroom',
  'Home Office',
  'Library / Study',
  'Guest Bedroom',
  'Rooftop Terrace',
  'Private Pool',
  'Cinema Room',
  'Wine Cellar',
  'Garage',
  'Garden View',
];

/* Simulated depth map animation: alternates Ken Burns zoom & parallax pan per photo */
const ANIMATION_PRESETS = [
  { scale: [1, 1.08], tx: [0, -2], ty: [0, -2], duration: 6 },
  { scale: [1.06, 1], tx: [-2, 2], ty: [0, 0], duration: 6 },
  { scale: [1, 1.1], tx: [2, -1], ty: [-1, 2], duration: 7 },
  { scale: [1.04, 1.08], tx: [0, -3], ty: [-1, 0], duration: 5 },
  { scale: [1.08, 1], tx: [-1, 2], ty: [2, -1], duration: 6 },
];

export function Photo3DWalkthrough() {
  const [photos, setPhotos] = useState<UploadedPhoto[]>([]);
  const [state, setState] = useState<WalkthroughState>('idle');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [editingLabel, setEditingLabel] = useState<string | null>(null);
  const [labelText, setLabelText] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [transitionActive, setTransitionActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const SLIDE_DURATION = 6500; // ms per photo

  // --- Upload logic ---
  const processFiles = useCallback((files: File[]) => {
    const imageFiles = files.filter(f => f.type.startsWith('image/'));
    if (!imageFiles.length) return;

    const newPhotos: UploadedPhoto[] = imageFiles.map((file, i) => ({
      id: `photo-${Date.now()}-${i}`,
      url: URL.createObjectURL(file),
      name: file.name,
      label: ROOM_LABELS[photos.length + i] ?? `Room ${photos.length + i + 1}`,
    }));

    setPhotos(prev => [...prev, ...newPhotos]);
  }, [photos.length]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) processFiles(Array.from(e.target.files));
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    processFiles(files);
  };

  const removePhoto = (id: string) => {
    setPhotos(prev => {
      const updated = prev.filter(p => p.id !== id);
      const removedIdx = prev.findIndex(p => p.id === id);
      if (currentIdx >= updated.length && updated.length > 0) {
        setCurrentIdx(updated.length - 1);
      } else if (currentIdx > removedIdx) {
        setCurrentIdx(c => Math.max(0, c - 1));
      }
      return updated;
    });
  };

  const startWalkthrough = () => {
    if (photos.length === 0) return;
    setState('processing');
    setCurrentIdx(0);
    setProgress(0);

    // Simulated AI depth processing
    setTimeout(() => {
      setState('touring');
      setIsPlaying(true);
    }, 2200);
  };

  // --- Playback engine ---
  const clearTimers = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (progressRef.current) clearInterval(progressRef.current);
  };

  useEffect(() => {
    if (state !== 'touring' || !isPlaying) {
      clearTimers();
      return;
    }

    setProgress(0);
    let elapsed = 0;
    const step = 100;
    progressRef.current = setInterval(() => {
      elapsed += step;
      setProgress(Math.min((elapsed / SLIDE_DURATION) * 100, 100));
    }, step);

    intervalRef.current = setInterval(() => {
      setTransitionActive(true);
      setTimeout(() => {
        setCurrentIdx(prev => (prev + 1) % photos.length);
        setTransitionActive(false);
        elapsed = 0;
        setProgress(0);
      }, 500);
    }, SLIDE_DURATION);

    return clearTimers;
  }, [state, isPlaying, currentIdx, photos.length]);

  const goTo = (idx: number) => {
    clearTimers();
    setTransitionActive(true);
    setTimeout(() => {
      setCurrentIdx(idx);
      setTransitionActive(false);
      setProgress(0);
    }, 300);
    setIsPlaying(false);
  };

  const togglePlay = () => setIsPlaying(p => !p);

  const currentPhoto = photos[currentIdx];
  const preset = ANIMATION_PRESETS[currentIdx % ANIMATION_PRESETS.length];

  // --- Render ---
  if (state === 'idle') {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-gray-950 overflow-auto">
        <div className="w-full max-w-2xl space-y-6">

          {/* Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/15 border border-violet-500/30 text-xs font-semibold text-violet-300 uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
              AI Photo-to-3D Engine
            </div>
            <h3 className="text-2xl font-bold text-white mt-2">
              Convert Your Photos into a 3D Walkthrough
            </h3>
            <p className="text-sm text-white/50 max-w-md mx-auto leading-relaxed">
              Upload exterior and interior building photos. Our AI depth engine generates an immersive, cinematic 3D parallax walkthrough from your 2D images.
            </p>
          </div>

          {/* Upload Zone */}
          <div
            className={`relative border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${
              dragOver
                ? 'border-violet-400 bg-violet-500/10 scale-[1.01]'
                : 'border-white/15 hover:border-white/30 hover:bg-white/5'
            }`}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center gap-3 pointer-events-none">
              <div className="w-16 h-16 rounded-2xl bg-violet-500/20 border border-violet-500/30 flex items-center justify-center text-3xl">
                📸
              </div>
              <div>
                <p className="text-white font-semibold text-sm">
                  {dragOver ? 'Drop photos here' : 'Click or drag & drop photos'}
                </p>
                <p className="text-white/40 text-xs mt-1">
                  JPG, PNG, WEBP — Multiple files supported
                </p>
              </div>
              <div className="flex items-center gap-4 text-[10px] text-white/30 uppercase tracking-wider">
                <span>🏛️ Exterior shots</span>
                <span>•</span>
                <span>🛋️ Interior rooms</span>
                <span>•</span>
                <span>🌇 Aerial views</span>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFileInput}
            />
          </div>

          {/* Photo Grid Preview */}
          {photos.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white/60 uppercase tracking-wider">
                  {photos.length} Photo{photos.length > 1 ? 's' : ''} Queued
                </span>
                <button
                  onClick={() => setPhotos([])}
                  className="text-xs text-red-400/70 hover:text-red-400 transition-colors"
                >
                  Clear All
                </button>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-52 overflow-y-auto pr-1">
                {photos.map((photo, i) => (
                  <div key={photo.id} className="relative group rounded-xl overflow-hidden aspect-video bg-gray-800">
                    <img src={photo.url} alt={photo.label} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1">
                      <button
                        onClick={e => { e.stopPropagation(); removePhoto(photo.id); }}
                        className="text-red-400 text-lg hover:scale-110 transition-transform"
                      >✕</button>
                    </div>
                    {/* Label badge */}
                    {editingLabel === photo.id ? (
                      <input
                        autoFocus
                        value={labelText}
                        onChange={e => setLabelText(e.target.value)}
                        onBlur={() => {
                          setPhotos(prev => prev.map(p => p.id === photo.id ? { ...p, label: labelText || p.label } : p));
                          setEditingLabel(null);
                        }}
                        onKeyDown={e => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
                        className="absolute bottom-0 left-0 right-0 text-[10px] bg-black/80 text-white px-1.5 py-1 outline-none border-t border-violet-500"
                        onClick={e => e.stopPropagation()}
                      />
                    ) : (
                      <button
                        className="absolute bottom-0 left-0 right-0 text-[10px] bg-black/70 text-white/70 px-1.5 py-1 text-left truncate hover:text-violet-300 transition-colors"
                        onClick={e => { e.stopPropagation(); setEditingLabel(photo.id); setLabelText(photo.label); }}
                        title="Click to rename room"
                      >
                        {i + 1}. {photo.label}
                      </button>
                    )}
                  </div>
                ))}
                {/* Add more button */}
                <button
                  className="aspect-video rounded-xl border-2 border-dashed border-white/10 hover:border-white/25 flex items-center justify-center text-white/30 hover:text-white/60 transition-all text-2xl"
                  onClick={() => fileInputRef.current?.click()}
                >
                  +
                </button>
              </div>
            </div>
          )}

          {/* AI Features Row */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: '🧠', label: 'AI Depth Mapping', desc: 'Monocular depth estimation from 2D' },
              { icon: '🎬', label: 'Cinematic Motion', desc: 'Ken Burns + parallax 3D effect' },
              { icon: '🏠', label: 'Room Detection', desc: 'Auto-labels interior spaces' },
            ].map(f => (
              <div key={f.label} className="p-3 bg-white/4 border border-white/8 rounded-xl space-y-1">
                <div className="text-lg">{f.icon}</div>
                <div className="text-xs font-semibold text-white/80">{f.label}</div>
                <div className="text-[10px] text-white/40">{f.desc}</div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <button
            onClick={startWalkthrough}
            disabled={photos.length === 0}
            className={`w-full py-4 rounded-2xl text-sm font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
              photos.length > 0
                ? 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-xl shadow-violet-500/25 active:scale-[0.98]'
                : 'bg-white/5 text-white/30 cursor-not-allowed'
            }`}
          >
            {photos.length === 0 ? '↑ Upload Photos First' : `🚀 Generate 3D Walkthrough (${photos.length} Photos)`}
          </button>
        </div>
      </div>
    );
  }

  if (state === 'processing') {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-6 bg-gray-950 p-8">
        <div className="relative w-24 h-24">
          <div className="absolute inset-0 rounded-full border-4 border-violet-500/20" />
          <div className="absolute inset-0 rounded-full border-4 border-t-violet-500 animate-spin" />
          <div className="absolute inset-3 rounded-full border-4 border-t-indigo-400 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
          <div className="absolute inset-0 flex items-center justify-center text-2xl">🧠</div>
        </div>
        <div className="text-center space-y-2">
          <h3 className="text-xl font-bold text-white">Processing {photos.length} Photos</h3>
          <p className="text-sm text-white/50">Running AI depth estimation & generating 3D motion paths...</p>
        </div>
        <div className="w-full max-w-xs space-y-2">
          {['Analyzing spatial depth...', 'Generating parallax layers...', 'Building navigation graph...'].map((step, i) => (
            <div key={step} className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full border-2 border-t-violet-400 animate-spin" style={{ animationDuration: `${0.8 + i * 0.3}s` }} />
              <span className="text-xs text-white/60">{step}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Touring state
  return (
    <div className="w-full h-full flex flex-col bg-black relative overflow-hidden">

      {/* 3D Photo Viewer */}
      <div className="flex-1 relative overflow-hidden">
        {currentPhoto && (
          <>
            {/* Depth background layer (blurred, slightly shifted) */}
            <div
              className="absolute inset-0 scale-110"
              style={{
                backgroundImage: `url(${currentPhoto.url})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                filter: 'blur(20px) brightness(0.4)',
                transform: 'scale(1.15)',
              }}
            />

            {/* Main animated photo */}
            <div
              className="absolute inset-0 transition-opacity duration-500"
              style={{ opacity: transitionActive ? 0 : 1 }}
            >
              <img
                key={currentPhoto.id}
                src={currentPhoto.url}
                alt={currentPhoto.label}
                className="w-full h-full object-contain"
                style={{
                  animation: `photo3dKenBurns ${preset.duration}s ease-in-out infinite alternate`,
                }}
              />
            </div>

            {/* 3D Grid Overlay */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage: `
                  linear-gradient(rgba(139,92,246,0.05) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(139,92,246,0.05) 1px, transparent 1px)
                `,
                backgroundSize: '60px 60px',
                maskImage: 'radial-gradient(ellipse at center, transparent 40%, black 100%)',
              }}
            />

            {/* Corner scanning lines */}
            <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-violet-400/60 rounded-tl" />
            <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-violet-400/60 rounded-tr" />
            <div className="absolute bottom-16 left-4 w-8 h-8 border-b-2 border-l-2 border-violet-400/60 rounded-bl" />
            <div className="absolute bottom-16 right-4 w-8 h-8 border-b-2 border-r-2 border-violet-400/60 rounded-br" />

            {/* Room Label */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 bg-black/60 backdrop-blur-md border border-white/10 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
              <span className="text-xs font-semibold text-white tracking-wide">{currentPhoto.label}</span>
              <span className="text-[10px] text-white/40 font-mono">{currentIdx + 1}/{photos.length}</span>
            </div>

            {/* 3D depth badge */}
            <div className="absolute top-4 right-16 flex items-center gap-1.5 px-3 py-1.5 bg-violet-600/30 backdrop-blur-sm border border-violet-500/30 rounded-lg">
              <span className="text-[10px] font-bold text-violet-300 uppercase tracking-wider">AI 3D Depth</span>
            </div>
          </>
        )}

        {/* Left / Right nav arrows */}
        <button
          onClick={() => goTo((currentIdx - 1 + photos.length) % photos.length)}
          className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white hover:bg-black/70 hover:scale-110 transition-all z-10"
        >
          ‹
        </button>
        <button
          onClick={() => goTo((currentIdx + 1) % photos.length)}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white hover:bg-black/70 hover:scale-110 transition-all z-10"
        >
          ›
        </button>
      </div>

      {/* Progress bar */}
      <div className="h-0.5 bg-white/10 relative">
        <div
          className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-none"
          style={{ width: `${isPlaying ? progress : (((currentIdx) / photos.length) * 100)}%` }}
        />
      </div>

      {/* Bottom controls */}
      <div className="bg-gray-950/90 backdrop-blur-md border-t border-white/5 p-3 space-y-3">

        {/* Thumbnails strip */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 px-1">
          {photos.map((photo, i) => (
            <button
              key={photo.id}
              onClick={() => goTo(i)}
              className={`flex-shrink-0 relative rounded-lg overflow-hidden transition-all ${
                i === currentIdx
                  ? 'ring-2 ring-violet-400 scale-105'
                  : 'opacity-50 hover:opacity-80'
              }`}
              style={{ width: 56, height: 40 }}
            >
              <img src={photo.url} alt={photo.label} className="w-full h-full object-cover" />
              {i === currentIdx && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-400" />
              )}
            </button>
          ))}

          {/* Add more photos during tour */}
          <button
            className="flex-shrink-0 w-14 h-10 rounded-lg border border-dashed border-white/15 hover:border-white/30 flex items-center justify-center text-white/30 hover:text-white/60 transition-all text-lg"
            onClick={() => fileInputRef.current?.click()}
          >
            +
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleFileInput}
          />
        </div>

        {/* Playback controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Play / Pause */}
            <button
              onClick={togglePlay}
              className="w-8 h-8 rounded-lg bg-violet-600 hover:bg-violet-500 flex items-center justify-center text-white text-xs transition-colors"
            >
              {isPlaying ? '⏸' : '▶'}
            </button>
            {/* Restart */}
            <button
              onClick={() => { goTo(0); setIsPlaying(true); }}
              className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 text-xs transition-colors"
              title="Restart"
            >
              ⟲
            </button>
          </div>

          <div className="text-[10px] text-white/40 font-mono text-center">
            {currentPhoto?.label} • Frame {currentIdx + 1}/{photos.length}
          </div>

          <div className="flex items-center gap-2">
            {/* Back to upload */}
            <button
              onClick={() => { setState('idle'); clearTimers(); }}
              className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 text-xs transition-colors"
            >
              + Add Photos
            </button>
            {/* Share / Export placeholder */}
            <button
              onClick={() => alert('Export as MP4 — connect your backend video renderer to enable this feature.')}
              className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-semibold transition-all"
            >
              Export Tour
            </button>
          </div>
        </div>
      </div>

      {/* CSS keyframes injected inline */}
      <style>{`
        @keyframes photo3dKenBurns {
          0%   { transform: scale(${preset.scale[0]}) translate(${preset.tx[0]}%, ${preset.ty[0]}%); }
          100% { transform: scale(${preset.scale[1]}) translate(${preset.tx[1]}%, ${preset.ty[1]}%); }
        }
      `}</style>
    </div>
  );
}
