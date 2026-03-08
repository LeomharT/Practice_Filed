varying vec2 vUv;

void main() {
  vec4 modelPosition = modelMatrix * vec4(position, 1.0);

  vec2 center = vec2(0.5);
  float distanceToCenter = distance(uv, center);
  distanceToCenter = abs(distanceToCenter);

  if (distanceToCenter > 0.3) {
    modelPosition.y += pow(5.0 * 0.3, 2.0);
  } else {
    modelPosition.y += pow(5.0 * distanceToCenter, 2.0);
  }

  modelPosition.y -= 5.0;

  vec4 viewPosition = viewMatrix * modelPosition;
  vec4 projectionPosition = projectionMatrix * viewPosition;

  gl_Position = projectionPosition;

  vUv = uv;
}
