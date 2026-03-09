varying vec3 vNDC;
varying vec2 vUv;

void main() {
  vec3 pos = position;

  vec4 modelViewOrigin = modelViewMatrix * vec4(vec3(0.0), 1.0);
  modelViewOrigin.xy += pos.xy;

  vec4 projectionPosition = projectionMatrix * modelViewOrigin;

  gl_Position = projectionPosition;

  vec3 ndc = gl_Position.xyz / gl_Position.w;

  vNDC = ndc * 0.5 + 0.5;
  vUv = uv;
}
