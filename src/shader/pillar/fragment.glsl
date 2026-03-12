varying float vH;
varying vec3 vNormal;

void main() {
  float h      = vH;
  vec3  color  = vec3(1.0);
  vec3  normal = normalize(vNormal);

  vec3  direction = normalize(vec3(3.0, 1.5, 0.0));
  float light     = dot(normal, direction);

  color = vec3(light);

  gl_FragColor = vec4(color, 1.0);

  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
