varying vec2 vUv;

uniform float uTime;
uniform sampler2D uNoiseTexture;

void main() {
  vec3 color = vec3(0.0);
  vec2 center = vec2(0.5);
  vec2 uv = vUv;

  float dist = distance(uv, center);
  dist *= 5.0;
  dist -= uTime * 0.5;
  dist = fract(dist);

  vec4 noiseColor = texture2D(uNoiseTexture, uv);

  color = noiseColor.rgb;

  gl_FragColor = vec4(color, 1.0);
}
