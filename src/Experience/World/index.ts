import { AxesHelper } from 'three';
import type { Experience } from '..';
import { Box } from './Box';

export class World {
  constructor(exp: Experience) {
    this._exp = exp;

    this.box = new Box(exp);

    /**
     * Helpers
     */
    const axesHelper = new AxesHelper();
    this._exp.scene.add(axesHelper);
  }

  private _exp: Experience;

  public box: Box;

  public update() {}
}
