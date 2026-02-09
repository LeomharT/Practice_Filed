import { BackSide, BoxGeometry, Mesh, ShaderMaterial } from 'three';
import type { Experience } from '..';
import fragmentShader from '../../shader/box/fragment.glsl?raw';
import vertexShader from '../../shader/box/vertex.glsl?raw';

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
    this._geometry = new BoxGeometry(1, 1, 3, 32, 32, 32);
  }

  private _setMaterial() {
    this._material = new ShaderMaterial({
      side: BackSide,
      fragmentShader,
      vertexShader,
      transparent: true,
    });
  }

  private _setMesh() {
    this._mesh = new Mesh(this._geometry, this._material);
  }
}
