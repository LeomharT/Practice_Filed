import { EventDispatcher, Texture } from 'three';
import { GLTFLoader, type GLTF } from 'three/examples/jsm/Addons.js';
import { sources } from '../../sources';

export type ResourcesLoaders = {
  gltfLoader: GLTFLoader;
};

export type ResourcesItems = {
  droneModel: GLTF;
};

export default class Resources extends EventDispatcher<{
  ready: {};
}> {
  constructor() {
    super();

    this._setLoaders();
    this._startLoading();
  }

  public loaders: ResourcesLoaders = {} as ResourcesLoaders;

  public items: ResourcesItems = {} as ResourcesItems;

  public toLoad: number = sources.length;

  public loaded: number = 0;

  private _setLoaders() {
    this.loaders.gltfLoader = new GLTFLoader();
    this.loaders.gltfLoader.setPath('/src/assets/models/');
  }

  private _startLoading() {
    for (const source of sources) {
      switch (source.type) {
        case 'gltfModel': {
          this.loaders.gltfLoader.load(source.path, (data) => {
            this._sourceLoaded(source, data);
          });
          break;
        }
        default:
          break;
      }
    }
  }

  private _sourceLoaded<T extends GLTF | Texture>(
    source: (typeof sources)[number],
    data: T,
  ) {
    this.items[source.name] = data as GLTF & Texture;

    this.loaded++;

    if (this.loaded === this.toLoad) {
      this.dispatchEvent({ type: 'ready' });
    }
  }
}
