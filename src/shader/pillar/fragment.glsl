varying float vH;

void main() {
  float h = vH;
  vec3 color = vec3(1.0);

  color = vec3(h);

  gl_FragColor = vec4(color, 1.0);
}
