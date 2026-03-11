varying vec3 vNormal;

void main() {
  vec3 color = vec3(0.0);
  vec3 normal = normalize(vNormal);
  vec3 direction = normalize(vec3(3.0, 1.5, 0.0));

  float light = dot(normal, direction);
  light = max(0.25, light);

  color += vec3(light);

  gl_FragColor = vec4(color, 1.0);
}
