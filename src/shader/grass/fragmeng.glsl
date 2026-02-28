varying vec2 vUv;
varying vec3 vPosition;

void main() {
  vec3 color = vec3(0.0, 1.0, 0.0);
  vec2 uv = vUv;

  color *= uv.y;

  gl_FragColor = vec4(color, 1.0);
}
