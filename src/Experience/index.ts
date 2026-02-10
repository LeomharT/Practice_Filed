import { Scene } from 'three';
import { Camera } from './Camera';
import { Renderer } from './Renderer';
import { DebugPane } from './Utils/DebugPane';
import Resources from './Utils/Resources';
import Sizes from './Utils/Size';
import Time from './Utils/Time';
import { World } from './World';

export class Experience {
  constructor() {
    // Utils
    this.time = new Time();
    this.sizes = new Sizes();
    this.pane = new DebugPane();

    // Core
    this.renderer = new Renderer(this);
    this.canvas = this.renderer.element;
    this.scene = new Scene();
    this.camera = new Camera(this);
    this.resources = new Resources();
    this.world = new World(this);

    // Event
    this.time.addEventListener('tick', this._update.bind(this));
  }

  public sizes: Sizes;
  public time: Time;
  public pane: DebugPane;

  public canvas: HTMLCanvasElement;
  public renderer: Renderer;
  public scene: Scene;
  public camera: Camera;
  public resources: Resources;
  public world: World;

  private _update() {
    const delta = this.time.clock.getDelta();

    this.world.update();

    this.camera.update(delta);
    this.renderer.render();
  }

  private static _instance: Experience;

  static get instance(): Experience {
    if (this._instance) return this._instance;
    return (this._instance = new Experience());
  }
}
