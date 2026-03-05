varying float vH;

uniform float uTime;

void main() {
  vec3 color = vec3(1.0);
  float h = vH;
  h *= 0.5;
  h += uTime;
  h = fract(h);

  color = mix(
    vec3(0.976, 0.941, 1.0),
    vec3(0.325, 0.113, 0.67),
    smoothstep(-0.5, 1.0, h)
  );

  gl_FragColor = vec4(color, 1.0);
}
