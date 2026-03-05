#include <simplex4DNoise>

attribute vec4 tangent;

varying vec3 vPosition;
varying vec3 vNormal;
varying float vWobble;

uniform float uTime;

vec2 rotate2D(vec2 v, float angle) {
  mat2 m = mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
  return v * m;
}

float getWobble(vec3 position) {
  vec3 wrapedPosition = position;
  wrapedPosition += snoise(vec4(position * 0.38, uTime * 0.12)) * 1.7;

  return snoise(
    vec4(
      wrapedPosition * 0.5, // XYZ
      uTime //W
    )
  ) *
  0.3;
}

void main() {
  vec4 modelPosition = modelMatrix * vec4(position, 1.0);

  vec3 bitTangnet = cross(normal, tangent.xyz);

  float shift = 0.01;
  vec3 positionA = modelPosition.xyz + tangent.xyz * shift;
  vec3 positionB = modelPosition.xyz + bitTangnet * shift;

  float wobble = getWobble(modelPosition.xyz);

  modelPosition.xyz += wobble * normal;
  positionA += getWobble(positionA) * normal;
  positionB += getWobble(positionB) * normal;

  vec3 toA = normalize(positionA - modelPosition.xyz);
  vec3 toB = normalize(positionB - modelPosition.xyz);

  vec3 newNormal = cross(toA, toB);

  modelPosition.xz = rotate2D(modelPosition.xz, uTime);

  vec4 modelNormal = modelMatrix * vec4(newNormal, 0.0);

  modelNormal.xz = rotate2D(modelNormal.xz, uTime);

  vec4 viewPosition = viewMatrix * modelPosition;
  vec4 projectionPosition = projectionMatrix * viewPosition;

  #ifdef IS_DEPTH_MATERIAL
  csm_Position += wobble * normal;
  #else
  gl_Position = projectionPosition;
  #endif

  vPosition = modelPosition.xyz;
  vNormal = modelNormal.xyz;
  vWobble = wobble / 0.3;
}
