varying vec2 vUv;
varying vec3 vNDC;

uniform sampler2D uFrame;

void main() {
  vec2 uv    = vUv;
  vec3 color = vec3(1.0);
  vec3 ndc   = vNDC;

  vec4 frameColor = texture2D(uFrame, ndc.xy);

  color = frameColor.rgb * vec3(1.0);

  gl_FragColor = vec4(color, 1.0);

  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
