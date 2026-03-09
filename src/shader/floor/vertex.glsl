varying vec2 vUv;

uniform sampler2D uNoiseTexture;

void main() {
  vec4 noiseColor = texture2D(uNoiseTexture, uv);
  vec3 transformed = position;
  transformed.z += noiseColor.r * 2.0;

  vec4 modelPosition = modelMatrix * vec4(transformed, 1.0);
  vec4 viewPosition = viewMatrix * modelPosition;
  vec4 projectionPosition = projectionMatrix * viewPosition;

  gl_Position = projectionPosition;

  vUv = uv;
}
