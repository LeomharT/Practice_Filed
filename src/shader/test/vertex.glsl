varying vec3 vNormal;

#include <simplex2DNoise>

float getElevation(vec2 v) {
  float e = snoise(vec2(v.x / 90.0, v.y / 90.0));
  e += snoise(vec2(v.x / 100.0, v.y / 100.0));
  e += snoise(vec2(v.x * 0.275, v.y * 0.275));
  return e;
}

void main() {
  float shift = 0.01;

  vec4 modelPosition = modelMatrix * vec4(position, 1.0);
  vec3 positionA     = modelPosition.xyz + vec3(shift, 0, 0);
  vec3 positionB     = modelPosition.xyz + vec3(0, 0, -shift);

  float elevation = getElevation(modelPosition.xz);

  modelPosition.y += elevation;
  positionA.y     += getElevation(positionA.xz);
  positionB.y     += getElevation(positionB.xz);

  vec3 toA = positionA - modelPosition.xyz;
  vec3 toB = positionB - modelPosition.xyz;

  vec3 N = cross(toA, toB);

  vec3 modelNormal        = transpose(inverse(mat3(modelMatrix))) * normal;
  vec4 viewPosition       = viewMatrix * modelPosition;
  vec4 projectionPosition = projectionMatrix * viewPosition;

  gl_Position = projectionPosition;

  vNormal = N;
}
