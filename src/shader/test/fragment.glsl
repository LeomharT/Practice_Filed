uniform vec3 uColor;
uniform vec3 uDirection;

varying vec3 vNormal;

void main() {
  vec3 color          = uColor;
  vec3 normal         = normalize(vNormal);
  vec3 sunOrientation = normalize(uDirection);

  float light = dot(normal, sunOrientation);
        light = max(light, 0.35);

  color *= light;

  gl_FragColor = vec4(color, 1.0);

  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
