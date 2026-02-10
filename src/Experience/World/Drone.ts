import type { Group } from 'three';
import type { Experience } from '..';

export class Drone {
  constructor(exp: Experience) {
    this._exp = exp;

    this._setModel();

    this._exp.scene.add(this._model);
  }

  private _exp: Experience;

  private _model!: Group;

  private _setModel() {
    // Setup model scene
    this._model = this._exp.resources.items.droneModel.scene;
    this._model.rotation.y = -Math.PI;
    this._model.scale.setScalar(0.5);
  }
}
