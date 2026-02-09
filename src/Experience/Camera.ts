import { PerspectiveCamera } from 'three';
import { OrbitControls, TrackballControls } from 'three/examples/jsm/Addons.js';
import type { Experience } from '.';

export class Camera {
  constructor(exp: Experience) {
    this._exp = exp;

    // Setup
    this._setInstance();
    this._setControls();

    this._setPane();
  }
  private _exp: Experience;

  public instance!: PerspectiveCamera;

  private _controls!: OrbitControls;

  private _controls2!: TrackballControls;

  private _setInstance() {
    this.instance = new PerspectiveCamera(
      30,
      this._exp.sizes.width / this._exp.sizes.height,
      0.1,
      1000,
    );

    this.instance.position.set(0, 0, 2);
    this._exp.scene.add(this.instance);
  }

  private _setControls() {
    this._controls = new OrbitControls(this.instance, this._exp.canvas);
    this._controls.enableDamping = true;
    this._controls.enablePan = false;
    this._controls.enableZoom = false;

    this._controls2 = new TrackballControls(this.instance, this._exp.canvas);
    this._controls2.noPan = true;
    this._controls2.noRotate = true;
    this._controls2.noZoom = false;
    this._controls2.zoomSpeed = 1.5;
  }

  private _setPane() {
    const folder = this._exp.pane.addFolder({ title: '📷 Camera' });

    folder
      .addBinding(this.instance, 'fov', {
        label: 'Fov',
        step: 1,
        min: 10,
        max: 100,
      })
      .on('change', () => this.instance.updateProjectionMatrix());
  }

  public resize() {
    this.instance.aspect = this._exp.sizes.width / this._exp.sizes.height;
    this.instance.updateProjectionMatrix();
  }

  public update(time: number) {
    const target = this._controls.target;
    this._controls.update(time);

    this._controls2.target.set(target.x, target.y, target.z);
    this._controls2.update();
  }
}
