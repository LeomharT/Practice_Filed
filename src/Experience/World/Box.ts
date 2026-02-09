import { BoxGeometry, FrontSide, Mesh, ShaderMaterial } from 'three';
import type { Experience } from '..';

export class Box {
  constructor(exp: Experience) {
    this._setGeometry();
    this._setMaterial();
    this._setMesh();

    exp.scene.add(this._mesh);
  }

  private _geometry!: BoxGeometry;

  private _material!: ShaderMaterial;

  private _mesh!: Mesh;

  private _setGeometry() {
    this._geometry = new BoxGeometry(1, 1, 1, 32, 32, 32);
  }

  private _setMaterial() {
    this._material = new ShaderMaterial({
      side: FrontSide,
    });
  }

  private _setMesh() {
    this._mesh = new Mesh(this._geometry, this._material);
    this._mesh.scale.setScalar(-1);
  }

  public update() {
    this._mesh.rotation.y += 0.01;
  }
}
