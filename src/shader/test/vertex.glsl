varying float vH;
varying vec2 vUv;

void main() {
  vec4 modelPosition      = modelMatrix * vec4(position, 1.0);
  vec4 viewPosition       = viewMatrix * modelPosition;
  vec4 projectionPosition = projectionMatrix * viewPosition;

  float h = modelPosition.y;

  gl_Position = projectionPosition;

  vH = h / 2.0;
  vH = (vH + 1.0) / 2.0;

  vUv = uv;
}
