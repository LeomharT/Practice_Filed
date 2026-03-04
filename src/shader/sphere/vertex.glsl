#include <simplex4DNoise>

attribute vec4 tangent;

varying vec3 vPosition;
varying vec3 vNormal;

uniform float uTime;

void main() {
  vec4 modelPosition = modelMatrix * vec4(position, 1.0);
  vec4 modelNormal = modelMatrix * vec4(normal, 0.0);

  float wobble = snoise((vec4(position, 0.0) + uTime) * 0.5);
  modelPosition.xyz += wobble * normal;

  vec3 bitTangnet = cross(modelNormal.xyz, tangent.xyz);

  vec4 viewPosition = viewMatrix * modelPosition;
  vec4 projectionPosition = projectionMatrix * viewPosition;

  gl_Position = projectionPosition;

  vPosition = modelPosition.xyz;
  vNormal = modelNormal.xyz;
}
