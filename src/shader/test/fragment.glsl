varying vec2 vUv;

uniform float uTime;

vec2 rotateUV(vec2 v, float a) {
  float c = cos(a);
  float s = sin(a);

  mat2 m = transpose(mat2(
    c, -s,
    s, c
  ));
  
  return m * v;
}

void main() {
  vec2 uv  = vUv;
       uv -= 0.5;
       uv  = rotateUV(uv, uTime);
       uv += 0.5;


  vec3 color = vec3(uv, 1.0);

  gl_FragColor = vec4(color, 1.0);
}
