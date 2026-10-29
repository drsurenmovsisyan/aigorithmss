import * as Cesium from 'cesium';
import type { Scene } from '../core/Scene';
import { LUXURY_PROPERTIES, type RealEstateProperty } from '../../react/features/realestate/data/properties';

export class RealEstateController {
  private viewer: Cesium.Viewer;
  private scene: Scene;
  private activeProperty: RealEstateProperty | null = null;
  private isOrbiting: boolean = false;
  private orbitAngle: number = 0;
  private orbitSpeed: number = 0.003; // Radians per frame
  private orbitRadius: number = 180;
  private orbitHeight: number = 210;
  private orbitPitch: number = -20;
  private renderListener: Cesium.Event.RemoveCallback | null = null;
  private propertyEntities: Cesium.Entity[] = [];
  private onPropertySelectCallback: ((property: RealEstateProperty) => void) | null = null;
  private clickHandler: Cesium.ScreenSpaceEventHandler | null = null;

  constructor(scene: Scene) {
    this.scene = scene;
    this.viewer = scene.viewer;
  }

  public setOnPropertySelect(callback: (property: RealEstateProperty) => void): void {
    this.onPropertySelectCallback = callback;
  }

  public enable(): void {
    console.log('🏢 Enabling Real Estate 3D Twin Controller...');
    // Enable Cesium default camera controls for free inspection when not in auto-orbit
    this.scene.enableDefaultCameraControls(true);
    
    // Add 3D pins for all properties
    this.createPropertyMarkers();

    // Setup click handler on entities
    this.setupClickHandler();

    // Start render listener for automated drone orbit
    this.startOrbitLoop();

    // Fly to first property by default if none selected
    if (!this.activeProperty && LUXURY_PROPERTIES.length > 0) {
      this.flyToProperty(LUXURY_PROPERTIES[0], true);
    }
  }

  public disable(): void {
    console.log('🏢 Disabling Real Estate Controller...');
    this.stopOrbit();
    this.removePropertyMarkers();
    
    if (this.clickHandler) {
      this.clickHandler.destroy();
      this.clickHandler = null;
    }

    if (this.renderListener) {
      this.renderListener();
      this.renderListener = null;
    }
  }

  private createPropertyMarkers(): void {
    this.removePropertyMarkers();

    LUXURY_PROPERTIES.forEach((prop) => {
      const position = Cesium.Cartesian3.fromDegrees(
        prop.location.longitude,
        prop.location.latitude,
        prop.location.altitude + 25 // Hover pin 25m above roof
      );

      const entity = this.viewer.entities.add({
        id: `re-pin-${prop.id}`,
        name: prop.title,
        position: position,
        point: {
          pixelSize: 14,
          color: Cesium.Color.fromCssColorString('#38bdf8'),
          outlineColor: Cesium.Color.WHITE,
          outlineWidth: 3,
          disableDepthTestDistance: Number.POSITIVE_INFINITY, // Always visible on top
        },
        label: {
          text: `${prop.flag} ${prop.priceFormatted}\n${prop.title}`,
          font: 'bold 12px "Inter", sans-serif',
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          fillColor: Cesium.Color.WHITE,
          outlineColor: Cesium.Color.BLACK,
          outlineWidth: 4,
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          pixelOffset: new Cesium.Cartesian2(0, -18),
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
          distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 25000),
        },
      });

      this.propertyEntities.push(entity);
    });
  }

  private removePropertyMarkers(): void {
    this.propertyEntities.forEach((ent) => {
      this.viewer.entities.remove(ent);
    });
    this.propertyEntities = [];
  }

  private setupClickHandler(): void {
    if (this.clickHandler) {
      this.clickHandler.destroy();
    }
    this.clickHandler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
    this.clickHandler.setInputAction((click: { position: Cesium.Cartesian2 }) => {
      const pickedObject = this.viewer.scene.pick(click.position);
      if (Cesium.defined(pickedObject) && pickedObject.id && typeof pickedObject.id.id === 'string') {
        const id = pickedObject.id.id as string;
        if (id.startsWith('re-pin-')) {
          const propId = id.replace('re-pin-', '');
          const prop = LUXURY_PROPERTIES.find((p) => p.id === propId);
          if (prop) {
            this.flyToProperty(prop, true);
            if (this.onPropertySelectCallback) {
              this.onPropertySelectCallback(prop);
            }
          }
        }
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
  }

  /**
   * Resolves the target camera altitude.
   * If orbitHeight is configured as absolute altitude (> prop altitude), use it directly.
   * Otherwise, treat it as height offset above the property roof.
   */
  private resolveCameraAltitude(property: RealEstateProperty): number {
    return this.orbitHeight > property.location.altitude
      ? this.orbitHeight
      : property.location.altitude + this.orbitHeight;
  }

  public flyToProperty(property: RealEstateProperty, startAutoOrbit: boolean = true): void {
    this.activeProperty = property;
    this.stopOrbit();

    this.orbitRadius = property.cameraTour.orbitRadius;
    this.orbitHeight = property.cameraTour.orbitHeight;
    this.orbitPitch = property.cameraTour.orbitPitch;
    this.orbitAngle = 0;

    const camAltitude = this.resolveCameraAltitude(property);

    // Initial approach position matches orbitAngle = 0
    // At orbitAngle = 0: dx = 0, dy = +orbitRadius (north of property)
    // Looking south (heading = PI radians = 180 degrees) directly at the property
    const latOffset = this.orbitRadius / 111320;
    const initialCamPos = Cesium.Cartesian3.fromDegrees(
      property.location.longitude,
      property.location.latitude + latOffset,
      camAltitude
    );

    this.viewer.camera.flyTo({
      destination: initialCamPos,
      orientation: {
        heading: Math.PI,
        pitch: Cesium.Math.toRadians(this.orbitPitch),
        roll: 0,
      },
      duration: 2.8,
      complete: () => {
        if (startAutoOrbit) {
          this.startOrbit();
        }
      },
    });
  }

  public flyToBalconyView(floor?: number): void {
    if (!this.activeProperty) return;
    this.stopOrbit();

    const prop = this.activeProperty;
    const METERS_PER_FLOOR = 3.2;
    const floorAltitude = floor !== undefined
      ? prop.location.altitude + (Math.max(1, floor) * METERS_PER_FLOOR) - METERS_PER_FLOOR + 1.8
      : prop.location.altitude + 2.5;

    // Position camera on the balcony looking towards balconyHeading
    const headingRad = Cesium.Math.toRadians(prop.cameraTour.balconyHeading);
    const forwardOffset = 2.0;
    const dx = Math.sin(headingRad) * forwardOffset;
    const dy = Math.cos(headingRad) * forwardOffset;
    const latOffset = dy / 111320;
    const lonOffset = dx / (111320 * Math.cos(Cesium.Math.toRadians(prop.location.latitude)));

    const balconyPos = Cesium.Cartesian3.fromDegrees(
      prop.location.longitude + lonOffset,
      prop.location.latitude + latOffset,
      floorAltitude
    );

    this.viewer.camera.flyTo({
      destination: balconyPos,
      orientation: {
        heading: headingRad,
        pitch: Cesium.Math.toRadians(prop.cameraTour.balconyPitch),
        roll: 0,
      },
      duration: 2.2,
    });
  }

  public startOrbit(): void {
    this.isOrbiting = true;
  }

  public stopOrbit(): void {
    this.isOrbiting = false;
  }

  public toggleOrbit(): boolean {
    this.isOrbiting = !this.isOrbiting;
    return this.isOrbiting;
  }

  public getIsOrbiting(): boolean {
    return this.isOrbiting;
  }

  public setOrbitSpeed(multiplier: number): void {
    this.orbitSpeed = 0.003 * multiplier;
  }

  public setOrbitDistance(deltaRadius: number): void {
    this.orbitRadius = Math.max(40, Math.min(1000, this.orbitRadius + deltaRadius));
  }

  public setOrbitAltitude(deltaHeight: number): void {
    this.orbitHeight = Math.max(10, Math.min(800, this.orbitHeight + deltaHeight));
  }

  public setTimeOfDay(hour: number): void {
    // Hour in 24h format (e.g. 17.5 = 5:30 PM sunset)
    const date = new Date();
    date.setUTCHours(Math.floor(hour), Math.floor((hour % 1) * 60), 0);
    this.viewer.clock.currentTime = Cesium.JulianDate.fromDate(date);
    this.viewer.scene.globe.enableLighting = true;
  }

  private startOrbitLoop(): void {
    if (this.renderListener) return;

    this.renderListener = this.viewer.scene.preRender.addEventListener(() => {
      if (!this.isOrbiting || !this.activeProperty) return;

      this.orbitAngle += this.orbitSpeed;
      if (this.orbitAngle > Math.PI * 2) {
        this.orbitAngle -= Math.PI * 2;
      }

      const prop = this.activeProperty;
      const camAltitude = this.resolveCameraAltitude(prop);

      // Spherical orbital transform
      // Convert angular offset to meters
      const dx = Math.sin(this.orbitAngle) * this.orbitRadius;
      const dy = Math.cos(this.orbitAngle) * this.orbitRadius;

      // Earth metric degree approximations
      const latOffset = dy / 111320;
      const lonOffset = dx / (111320 * Math.cos(Cesium.Math.toRadians(prop.location.latitude)));

      const camPosition = Cesium.Cartesian3.fromDegrees(
        prop.location.longitude + lonOffset,
        prop.location.latitude + latOffset,
        camAltitude
      );

      // Lock camera heading toward the center
      const heading = this.orbitAngle + Math.PI; // Looking in opposite direction of angle vector
      
      this.viewer.camera.setView({
        destination: camPosition,
        orientation: {
          heading: heading,
          pitch: Cesium.Math.toRadians(this.orbitPitch),
          roll: 0,
        },
      });
    });
  }

  public getActiveProperty(): RealEstateProperty | null {
    return this.activeProperty;
  }
}
