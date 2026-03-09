varying vec2 vUv;
varying vec3 vPosition;

uniform float uTime;
uniform sampler2D uNoiseTexture;

#include <simplex3DNoise>

void main() {
  vec3 color = vec3(0.0);
  vec2 center = vec2(0.5);
  vec2 uv = vUv;

  float dist = distance(uv, center);
  dist *= 5.0;
  dist -= uTime * 0.5;
  dist = fract(dist);

  vec4 noiseColor = texture2D(uNoiseTexture, uv * 0.5);
  float noise = snoise(vPosition * 0.45);

  float colorMix = smoothstep(0.0, 0.5, noiseColor.r);

  if (colorMix >= 1.0) discard;

  colorMix *= 10.0;
  colorMix -= uTime;
  colorMix = fract(colorMix);

  float toShore = smoothstep(0.0, 0.7, noiseColor.r);
  if (toShore < 0.5) discard;

  float gradient = smoothstep(toShore, 1.2, 1.0 - colorMix);
  gradient += noise;

  if (gradient < 0.9) discard;

  color = vec3(gradient);

  gl_FragColor = vec4(color, 1.0);
}
