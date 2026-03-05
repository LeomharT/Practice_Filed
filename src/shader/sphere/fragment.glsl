#include <simplex3DNoise>

varying vec3 vPosition;
varying vec3 vNormal;
varying float vWobble;

uniform float uProgress;

void main() {
  vec3 color = vec3(1.0);
  vec3 normal = normalize(vNormal);
  vec3 edgeColor = vec3(0.827, 0.239, 0.09);
  float wobble = vWobble;

  float noise = snoise(vPosition * 0.5);
  noise = (noise + 1.0) / 2.0;

  if (noise < uProgress) discard;

  color = mix(
    vec3(0.415, 0.883, 0.381),
    vec3(0.125, 0.731, 0.254),
    vPosition.z
  );

  vec3 lightDirection = vec3(0.0, 0.0, -1.0);
  lightDirection = normalize(lightDirection);

  float lightColor = dot(normal, lightDirection);
  lightColor = max(0.0, lightColor);

  color = mix(
    vec3(0.768, 0.113, 0.498),
    //
    vec3(0.325, 0.113, 0.67),
    //
    wobble
  );

  color *= vec3(lightColor) + 0.05;

  if (uProgress > 0.0 && noise < uProgress + 0.05) {
    color = edgeColor * lightColor;
  }

  gl_FragColor = vec4(color, 1.0);

  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
