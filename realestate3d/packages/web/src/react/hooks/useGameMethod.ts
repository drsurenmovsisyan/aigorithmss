import { useGameBridge } from './useGameBridge';
import type { CameraType } from '../../cesium/managers/CameraManager';
import type { GameMode, VehicleStateData } from '../../cesium/bridge/types';
import type { QualityConfig } from '../../cesium/core/Scene';
import type { RealEstateProperty } from '../features/realestate/data/properties';

export function useGameMethod() {
  const bridge = useGameBridge();

  return {
    switchCamera: () => bridge.switchCamera(),
    getCameraType: (): CameraType => bridge.getCameraType(),
    toggleRoverMode: () => bridge.toggleRoverMode(),
    toggleVehicleType: () => bridge.toggleVehicleType(),
    getRoverMode: (): boolean => bridge.getRoverMode(),
    toggleCollisionDetection: () => bridge.toggleCollisionDetection(),
    getCollisionDetection: (): boolean => bridge.getCollisionDetection(),
    getVehicleState: (): VehicleStateData | null => bridge.getVehicleState(),
    teleportTo: (longitude: number, latitude: number, altitude: number, heading?: number) => 
      bridge.teleportTo(longitude, latitude, altitude, heading),
    restart: () => bridge.restart(),
    getQualitySettings: (): QualityConfig => bridge.getQualitySettings(),
    updateQualitySettings: (config: Partial<QualityConfig>) => bridge.updateQualitySettings(config),
    applyQualityPreset: (preset: 'performance' | 'balanced' | 'quality' | 'ultra') => bridge.applyQualityPreset(preset),
    toggleBuilderMode: () => bridge.toggleBuilderMode(),
    setMode: (mode: GameMode) => bridge.setMode(mode),
    getMode: (): GameMode => bridge.getMode(),
    setThrottle: (percent: number) => bridge.setThrottle(percent),
    flyToRealEstateProperty: (property: RealEstateProperty, startAutoOrbit?: boolean) =>
      bridge.flyToRealEstateProperty(property, startAutoOrbit),
    flyToRealEstateBalcony: (floor?: number) => bridge.flyToRealEstateBalcony(floor),
    toggleRealEstateOrbit: () => bridge.toggleRealEstateOrbit(),
    setRealEstateSunHour: (hour: number) => bridge.setRealEstateSunHour(hour),
    setRealEstateOrbitSpeed: (multiplier: number) => bridge.setRealEstateOrbitSpeed(multiplier),
    setRealEstateOrbitDistance: (deltaRadius: number) => bridge.setRealEstateOrbitDistance(deltaRadius),
    getRealEstateController: () => bridge.getRealEstateController(),
    flyToBalconyView: (_property: RealEstateProperty, floor: number) => {
      bridge.flyToRealEstateBalcony(floor);
    },
  };
}


