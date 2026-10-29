import { useGameMode } from '../../../hooks/useGameMode';
import type { GameMode } from '../../../../cesium/bridge/types';

export function ModeToggle() {
  const { mode, setMode } = useGameMode();

  const modes: { id: GameMode; label: string; icon: string }[] = [
    { id: 'play', label: 'Flight Sim', icon: '✈️' },
    { id: 'realestate', label: 'Real Estate 3D', icon: '🏢' },
    { id: 'builder', label: 'Builder', icon: '🏗️' },
  ];

  return (
    <div className="glass-panel p-1 flex items-center gap-1 border border-white/10 shadow-2xl">
      {modes.map((item) => {
        const isActive = mode === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setMode(item.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              isActive
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/40 font-semibold'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}
