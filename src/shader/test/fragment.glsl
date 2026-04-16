varying vec3 vNormal;

uniform vec3 uColor;
uniform vec3 uDirection;

void main() {
  vec3 normal = normalize(vNormal);
  vec3 direction = uDirection;
  vec3 color = vec3(1.0);

  float light = dot(normal, direction);
  light = max(0.175, light);

  color = uColor * light;

  gl_FragColor = vec4(color, 1.0);

  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
