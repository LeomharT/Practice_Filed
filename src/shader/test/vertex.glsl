#include <simplex2DNoise>

varying vec3 vNormal;

uniform float uTime;

float getPositionY(vec2 v) {
  float y  = snoise(vec2(v.x / 50.0, uTime));
        y *= 0.4 * snoise(vec2(v.x / 28.0, v.y / 16.0));
        y *= 14.0 * snoise(vec2(v.x / 10.0, v.y / 10.0));
  return y;
}

void main() {
  float shift = 0.01;

  vec4 modelPosition = modelMatrix * vec4(position, 1.0);
  vec3 positionA     = modelPosition.xyz + vec3(shift, 0, 0);
  vec3 positionB     = modelPosition.xyz + vec3(0, 0, -shift);

  float elevation = getPositionY(modelPosition.xz);

  modelPosition.y += elevation;
  positionA.y     += getPositionY(positionA.xz);
  positionB.y     += getPositionY(positionB.xz);

  vec3 toA = normalize(positionA - modelPosition.xyz);
  vec3 toB = normalize(positionB - modelPosition.xyz);

  vec3 N = cross(toA, toB);

  vec4 modelNormal        = vec4(N, 0.0);
  vec4 viewPosition       = viewMatrix * modelPosition;
  vec4 projectionPosition = projectionMatrix * viewPosition;

  gl_Position = projectionPosition;

  vNormal = modelNormal.xyz;
}
