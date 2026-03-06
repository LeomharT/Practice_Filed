uniform sampler2D uDiffuseTexture;

varying vec2 vUv;
varying vec3 vNDC;

void main() {
  vec2 uv = vUv;
  vec3 color = vec3(1.0);
  vec3 ndc = vNDC;

  vec4 diffuseColor = texture2D(uDiffuseTexture, ndc.xy);
  color = diffuseColor.rgb;
  //   color += vec3(0.125, 0.345, 0.012);

  gl_FragColor = vec4(color, 1.0);

  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
