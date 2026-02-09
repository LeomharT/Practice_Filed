import { WebGLRenderer } from 'three';
import type { Experience } from '.';

export class Renderer {
  constructor(exp: Experience) {
    this._exp = exp;

    this._setInstance();
  }

  private _exp: Experience;

  private _instance!: WebGLRenderer;

  get element() {
    return this._instance.domElement;
  }

  private _setInstance() {
    this._instance = new WebGLRenderer({
      antialias: true,
      alpha: true,
    });
    this._instance.setSize(this._exp.sizes.width, this._exp.sizes.height);
    this._instance.setPixelRatio(this._exp.sizes.pixelRatio);
  }

  public render() {
    this._instance.render(this._exp.scene, this._exp.camera.instance);
  }

  public resize() {
    this._instance.setSize(this._exp.sizes.width, this._exp.sizes.height);
  }
}
