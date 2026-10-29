import { useGameMethod } from './useGameMethod';
import { useGameEventCallback } from './useGameEvent';
import { useState, useEffect } from 'react';
import type { GameMode, ModeChangedData } from '../../cesium/bridge/types';

export function useGameMode() {
  const [mode, setMode] = useState<GameMode>('play');
  const methods = useGameMethod();

  useGameEventCallback('modeChanged', (data: ModeChangedData) => {
    setMode(data.mode);
  });

  useEffect(() => {
    const currentMode = methods.getMode();
    if (currentMode) {
      setMode(currentMode);
    }
  }, [methods]);

  return {
    mode,
    isBuilder: mode === 'builder',
    isPlay: mode === 'play',
    isRealEstate: mode === 'realestate',
    toggleBuilder: methods.toggleBuilderMode,
    setMode: methods.setMode,
  };
}
