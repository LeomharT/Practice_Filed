import { AmbientLight, DirectionalLight } from 'three';
import type { Experience } from '..';

export class Environment {
  constructor(exp: Experience) {
    this._exp = exp;

    this._setAmbientLight();
    this._setSunLight();
  }

  private _exp: Experience;

  private _setAmbientLight() {
    const ambientLight = new AmbientLight(0xffffff, 2.25);
    this._exp.scene.add(ambientLight);
  }

  private _setSunLight() {
    const sunLight = new DirectionalLight('#ffffff', 4.0);
    sunLight.castShadow = true;
    sunLight.shadow.camera.far = 15;
    sunLight.shadow.mapSize.set(1024, 1024);
    sunLight.shadow.normalBias = 0.05;
    sunLight.position.set(3.5, 2, 0);

    this._exp.scene.add(sunLight);
  }
}
