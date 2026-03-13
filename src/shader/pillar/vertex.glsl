precision highp float;

attribute vec4 tangent;

varying float vH;
varying vec3 vNormal;

uniform float uTime;

#include <simplex4DNoise>

float getWobble(vec3 _p) {
  vec3 warpPos = _p;
  warpPos += snoise(
    vec4(
      warpPos * 0.38,
      uTime * 0.12
    )
  ) * 0.74;

  return snoise(
    vec4(
      warpPos * 0.5,
      uTime * 0.4
    )
  ) * 0.12;
}

vec2 rotate2D(vec2 _p, float _angle) {
  mat2 m = mat2(
    cos(_angle), -sin(_angle),
    sin(_angle), cos(_angle)
  );

  return _p * m;
}

void main() {
  vec3  biTangent = cross(normal, tangent.xyz);
  float shift     = 0.01;

  vec4 modelPosition = modelMatrix * vec4(position, 1.0);

  modelPosition.y -= 2.5;
  modelPosition.xy = rotate2D(modelPosition.xy, uTime);
  modelPosition.y += 2.5;

  vec3 positionA = modelPosition.xyz + tangent.xyz * shift;
  vec3 positionB = modelPosition.xyz + biTangent * shift;

  float wobble = getWobble(modelPosition.xyz);

  modelPosition.xyz += wobble * normal;
  positionA         += getWobble(positionA) * normal;
  positionB         += getWobble(positionB) * normal;

  vec3 toA = normalize(positionA - modelPosition.xyz);
  vec3 toB = normalize(positionB - modelPosition.xyz);

  vec4 modelNormal        = modelMatrix * vec4(cross(toA, toB), 0.0);
  vec4 viewPosition       = viewMatrix * modelPosition;
  vec4 projectionPosition = projectionMatrix * viewPosition;

  gl_Position = projectionPosition;

  vH = position.y / 5.0;
  vNormal = modelNormal.xyz;
}
