varying vec2 vUv;
varying vec3 vNormal;

#include <simplex2DNoise>

float getElevation(vec2 v) {
  float e = 2.0 * snoise(vec2(v.x / 50.0, v.y / 50.0));
  e += 1.5 * snoise(vec2(v.x / 8.0, v.y / 8.0));
  e += 0.2 * snoise(vec2(v.x / 3.0, v.y / 3.0));

  return e;
}

void main() {
  float shift = 0.01;

  vec4 modelPosition = modelMatrix * vec4(position, 1.0);
  vec3 positionA     = modelPosition.xyz + vec3(shift, 0.0, 0.0);
  vec3 positionB     = modelPosition.xyz + vec3(0.0, 0.0, -shift);

  modelPosition.y += getElevation(modelPosition.xz);
  positionA.y     += getElevation(positionA.xz);
  positionB.y     += getElevation(positionB.xz);

  vec3 toA = normalize(positionA - modelPosition.xyz);
  vec3 toB = normalize(positionB - modelPosition.xyz);

  vec3 N = cross(toA, toB);

  vec3 modelNormal        = transpose(inverse(mat3(modelMatrix))) * normal;
  vec4 viewPosition       = viewMatrix * modelPosition;
  vec4 projectionPosition = projectionMatrix * viewPosition;

  gl_Position = projectionPosition;                                                                                      

  // Varying
  vUv     = uv;
  vNormal = N;
}
