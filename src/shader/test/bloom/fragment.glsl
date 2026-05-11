varying vec2 vUv;

uniform sampler2D uDiffuse;
uniform sampler2D uBloomTexture;

void main() {
  vec2 uv = vUv;
  vec3 color = vec3(0.0);

  vec4 diffuse = texture2D(uDiffuse, uv);
  vec4 bloom   = texture2D(uBloomTexture, uv);

  color = diffuse.rgb + bloom.rgb;

  gl_FragColor = vec4(color, 1.0);

  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
