varying float vH;

uniform float uTime;

vec2 rotate2D(vec2 v, float angle) {
  mat2 m = mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
  return v * m;
}

void main() {
  #include <begin_vertex>

  float h = (transformed.y + 5.0) / 10.0;

  transformed.xy = rotate2D(transformed.xy, uTime);

  #include <project_vertex>

  vH = h;
}
