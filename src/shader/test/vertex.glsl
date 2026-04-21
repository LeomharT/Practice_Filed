attribute vec3 tangent;

varying vec3 vNormal;

uniform float uTime;

#include <simplex4DNoise>

vec2 rotation2D(vec2 v, float angle) {
  mat2 m = mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
  return v * m;
}

float getWobble(vec3 v) {
  return snoise(vec4(v, 0.0));
}

void main() {
  float shift     = 0.01;
  vec3  biTangent = cross(normal, tangent);

  vec4 modelPosition = modelMatrix * vec4(position, 1.0);
  vec3 positionA     = modelPosition.xyz + tangent * shift;
  vec3 positionB     = modelPosition.xyz + biTangent * shift;

  float wobble = getWobble(modelPosition.xyz);

  modelPosition.xyz += wobble * normal;
  positionA         += getWobble(positionA) * normal;
  positionB         += getWobble(positionB) * normal;

  vec3 toA = normalize(positionA - modelPosition.xyz);
  vec3 toB = normalize(positionB - modelPosition.xyz);

  vec3 N = cross(toA, toB);

  vec4 modelNormal = modelMatrix * vec4(normal, 0.0);

  vec4 viewPosition = viewMatrix * modelPosition;
  vec4 projectionPosition = projectionMatrix * viewPosition;

  gl_Position = projectionPosition;

  // Varying
  vNormal = N;
}
