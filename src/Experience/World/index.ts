import { AxesHelper } from 'three';
import type { Experience } from '..';
import { Box } from './Box';
import { Drone } from './Drone';
import { Environment } from './Environment';

export class World {
  constructor(exp: Experience) {
    this._exp = exp;

    /**
     * Scene
     */

    this.env = new Environment(exp);
    this.box = new Box(exp);

    /**
     * Helpers
     */
    const axesHelper = new AxesHelper();
    this._exp.scene.add(axesHelper);

    /**
     * Resources
     */
    this._exp.resources.addEventListener('ready', () => {
      console.log('Scene ready');
      this.drone = new Drone(exp);
    });
  }

  private _exp: Experience;

  public env: Environment;

  public box: Box;

  public drone?: Drone;

  public update() {}
}
