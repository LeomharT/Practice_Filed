#include <simplex4DNoise>

attribute vec4 tangent;

varying vec3 vPosition;
varying vec3 vNormal;
varying float vWobble;

uniform float uTime;

float getWobble(vec3 position) {
  return snoise(
    vec4(
      position, // XYZ
      0.0 //W
    )
  );
}

void main() {
  vec4 modelPosition = modelMatrix * vec4(position, 1.0);

  vec3 bitTangnet = cross(normal, tangent.xyz);

  float shift = 0.01;
  vec3 positionA = modelPosition.xyz + tangent.xyz * shift;
  vec3 positionB = modelPosition.xyz + bitTangnet * shift;

  float wobble = getWobble(modelPosition.xyz + uTime);

  modelPosition.xyz += wobble * normal;
  positionA += getWobble(positionA + uTime) * normal;
  positionB += getWobble(positionB + uTime) * normal;

  vec3 toA = normalize(positionA - modelPosition.xyz);
  vec3 toB = normalize(positionB - modelPosition.xyz);

  vec3 newNormal = cross(toA, toB);

  vec4 modelNormal = modelMatrix * vec4(newNormal, 0.0);
  vec4 viewPosition = viewMatrix * modelPosition;
  vec4 projectionPosition = projectionMatrix * viewPosition;

  #ifdef IS_DEPTH_MATERIAL
  csm_Position += wobble * normal;
  #else
  gl_Position = projectionPosition;
  #endif

  vPosition = modelPosition.xyz;
  vNormal = modelNormal.xyz;
  vWobble = wobble;
}
