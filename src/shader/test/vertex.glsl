varying vec3 vNormal;

#include <simplex2DNoise>

float getPositionY(vec2 v) {
  float y = snoise(vec2(v.x / 2.5, v.y / 2.5));
  y *= snoise(vec2(v.x / 6.0, v.y / 3.25));

  return y;
}

void main() {
  float shift = 0.01;

  vec4 modelPosition = modelMatrix * vec4(position, 1.0);
  vec3 positionA = modelPosition.xyz + vec3(shift, 0.0, 0.0);
  vec3 positionB = modelPosition.xyz + vec3(0.0, 0.0, -shift);

  modelPosition.y = getPositionY(modelPosition.xz);
  positionA.y = getPositionY(positionA.xz);
  positionB.y = getPositionY(positionB.xz);

  vec3 toA = normalize(positionA - modelPosition.xyz);
  vec3 toB = normalize(positionB - modelPosition.xyz);

  vec3 N = cross(toA, toB);

  vec4 modelNormal = modelMatrix * vec4(N, 0.0);
  vec4 viewPosition = viewMatrix * modelPosition;
  vec4 projectionPosition = projectionMatrix * viewPosition;

  gl_Position = projectionPosition;

  vNormal = modelNormal.xyz;
}
