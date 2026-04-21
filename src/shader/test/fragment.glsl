// Varying
varying vec3 vNormal;
// Unifrom
uniform vec3 uLightDirection;

void main() {
  vec3 color  = vec3(0.0);
  vec3 normal = normalize(vNormal);

  vec3  sunOrientation = uLightDirection;
  float light          = dot(normal, sunOrientation);

  color = vec3(max(0.05, light));

  gl_FragColor = vec4(color, 1.0);

  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
