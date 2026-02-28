varying vec2 vUv;
varying vec3 vPosition;

uniform sampler2D uAlphaTexture;
uniform sampler2D uDiffuseTexture;

void main() {
  vec3 color = vec3(0.0, 0.6, 0.0);
  vec2 uv = vUv;

  color *= uv.y;

  float alpha = texture2D(uAlphaTexture, uv).r;
  if (alpha <= 0.5) discard;

  vec4 diffuseColor = texture2D(uDiffuseTexture, uv);
  color *= diffuseColor.rgb;

  gl_FragColor = vec4(color, 1.0);

  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
