varying vec2 vUv;

uniform float uTime;

void main() {
  vec3 color = vec3(0.0);
  vec2 center = vec2(0.5);
  vec2 uv = vUv;

  float distanceToCenter = distance(uv, center);
  if (distanceToCenter > 0.5) discard;

  distanceToCenter *= 5.0;
  distanceToCenter -= uTime * 0.5;
  distanceToCenter = fract(distanceToCenter);

  color = vec3(distanceToCenter);

  gl_FragColor = vec4(color, 1.0);
}
