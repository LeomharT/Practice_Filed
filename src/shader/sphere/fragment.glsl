#include <simplex3DNoise>

varying vec3 vPosition;
varying vec3 vNormal;
varying float vWobble;

uniform float uProgress;

void main() {
  vec3 color = vec3(1.0);
  vec3 normal = normalize(vNormal);
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

  vec3 lightDirection = vec3(0.0, 0.0, -1.0);
  lightDirection = normalize(lightDirection);

  float lightColor = dot(normal, lightDirection);

  float wobble = vWobble;

  color = mix(
    vec3(0.236, 0.223, 0.187),
    //
    vec3(0.718, 0.296, 0.443),
    //
    wobble
  );

  color = mix(color, vec3(1.0), smoothstep(0.5, 1.0, wobble));

  gl_FragColor = vec4(color, 1.0);

  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
