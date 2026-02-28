#define PI 3.141592627

attribute vec3 aOffset;
attribute vec4 orientation;

varying vec2 vUv;
varying vec3 vPosition;

uniform float uTime;

//WEBGL-NOISE FROM https://github.com/stegu/webgl-noise
//Description : Array and textureless GLSL 2D simplex noise function. Author : Ian McEwan, Ashima Arts. Maintainer : stegu Lastmod : 20110822 (ijm) License : Copyright (C) 2011 Ashima Arts. All rights reserved. Distributed under the MIT License. See LICENSE file. https://github.com/ashima/webgl-noise https://github.com/stegu/webgl-noise
vec3 mod289(vec3 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}
vec2 mod289(vec2 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}
vec3 permute(vec3 x) {
  return mod289((x * 34.0 + 1.0) * x);
}
float snoise(vec2 v) {
  const vec4 C = vec4(
    0.211324865405187,
    0.366025403784439,
    -0.577350269189626,
    0.024390243902439
  );
  vec2 i = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1;
  i1 = x0.x > x0.y ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod289(i);
  vec3 p = permute(
    permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0)
  );
  vec3 m = max(
    0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)),
    0.0
  );
  m = m * m;
  m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}
//END NOISE

//https://www.geeks3d.com/20141201/how-to-rotate-a-vertex-by-a-quaternion-in-glsl/
vec3 rotateVectorByQuaternion(vec3 v, vec4 q) {
  return 2.0 * cross(q.xyz, v * q.w + cross(q.xyz, v)) + v;
}

//https://en.wikipedia.org/wiki/Slerp
vec4 slerp(vec4 v0, vec4 v1, float t) {
  // Only unit quaternions are valid rotations.
  // Normalize to avoid undefined behavior.
  normalize(v0);
  normalize(v1);

  // Compute the cosine of the angle between the two vectors.
  float dot_ = dot(v0, v1);

  // If the dot product is negative, slerp won't take
  // the shorter path. Note that v1 and -v1 are equivalent when
  // the negation is applied to all four components. Fix by
  // reversing one quaternion.
  if (dot_ < 0.0) {
    v1 = -v1;
    dot_ = -dot_;
  }

  const float DOT_THRESHOLD = 0.9995;
  if (dot_ > DOT_THRESHOLD) {
    // If the inputs are too close for comfort, linearly interpolate
    // and normalize the result.
    vec4 result = t * (v1 - v0) + v0;
    normalize(result);
    return result;
  }

  // Since dot is in range [0, DOT_THRESHOLD], acos is safe
  float theta_0 = acos(dot_); // theta_0 = angle between input vectors
  float theta = theta_0 * t; // theta = angle between v0 and result
  float sin_theta = sin(theta); // compute this value only once
  float sin_theta_0 = sin(theta_0); // compute this value only once
  float s0 = cos(theta) - dot_ * sin_theta / sin_theta_0; // == sin(theta_0 - theta) / sin(theta_0)
  float s1 = sin_theta / sin_theta_0;
  return s0 * v0 + s1 * v1;
}

vec2 rotate2D(vec2 v, float angle) {
  mat2 m = mat2(cos(angle), -sin(angle), sin(angle), cos(angle));

  return v * m;
}

void main() {
  vec3 transformed = vec3(position);
  vec3 viewDirection = normalize(cameraPosition - (transformed + aOffset));

  float angle = atan(viewDirection.z, viewDirection.x);
  transformed.xz = rotate2D(transformed.xz, angle - PI / 2.0);

  vec4 modelPosition = modelMatrix * vec4(transformed + aOffset, 1.0);
  vec4 viewPosition = viewMatrix * modelPosition;
  vec4 projectionPosition = projectionMatrix * viewPosition;

  gl_Position = projectionPosition;

  vUv = uv;
  vPosition = modelPosition.xyz;
}
