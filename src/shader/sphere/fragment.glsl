#include <simplex3DNoise>

varying vec3 vPosition;

uniform float uProgress;

void main() {
  vec3 color = vec3(1.0);
  vec3 edgeColor = vec3(0.827, 0.239, 0.09);

  float noise = snoise(vPosition * 0.5);
  noise = (noise + 1.0) / 2.0;

  if (noise < uProgress) discard;

  if (uProgress > 0.0 && noise < uProgress + 0.05) {
    color = edgeColor;
  }

  color = mix(
    vec3(0.415, 0.883, 0.381),
    vec3(0.125, 0.731, 0.254),
    vPosition.z
  );

  gl_FragColor = vec4(color, 1.0);

  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
