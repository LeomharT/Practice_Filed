varying vec2 vUv;

void main() {
  vec4 modelPosition = modelMatrix * vec4(position, 1.0);

  vec2 center = vec2(0.5);
  float distanceToCenter = distance(uv, center);
  distanceToCenter = abs(distanceToCenter);

  modelPosition.y += pow(2.0 * distanceToCenter, 2.0);
  modelPosition.y -= 2.0;

  vec4 viewPosition = viewMatrix * modelPosition;
  vec4 projectionPosition = projectionMatrix * viewPosition;

  gl_Position = projectionPosition;

  vUv = uv;
}
