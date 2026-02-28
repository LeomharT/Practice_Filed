varying vec2 vUv;
varying vec3 vPosition;
varying float vH;

uniform sampler2D uAlphaTexture;
uniform sampler2D uDiffuseTexture;
uniform vec3 uTipColor;
uniform vec3 uBottomColor;

void main() {
  vec3 color = vec3(0.0);
  vec2 uv = vUv;

  float alpha = texture2D(uAlphaTexture, uv).r;
  if (alpha <= 0.5) discard;

  vec4 diffuseColor = texture2D(uDiffuseTexture, uv);
  color = diffuseColor.rgb;
  color = mix(uTipColor, color, vH);
  color = mix(uBottomColor, color, vH);

  gl_FragColor = vec4(color, 1.0);

  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
