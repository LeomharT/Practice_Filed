#define PI 3.1415926

varying vec2 vUv;

uniform float uTime;
uniform float uWidth;
uniform vec3 uColor;

vec2 rotateUV(vec2 uv, float angle) {
  mat2 m = mat2(
    cos(angle), -sin(angle),
    sin(angle), cos(angle)
  );

  return uv * m;
}

void main(){
  vec3  color  = vec3(1.0);
  vec2  uv     = vUv;
  vec2  center = vec2(0.5);
  float angle  = PI * 0.1;
  float aspect = uWidth / 2.0;

  uv.y /= aspect;

  uv -= center;
  uv = rotateUV(uv, angle);
  uv += center;

  uv.x *= uWidth * 2.0;
  uv.x += uTime;
  uv    = fract(uv);

  vec2 halfUv = abs(uv - center);

  float c = step(halfUv.x, 0.25);

  color = uColor * c;

  gl_FragColor = vec4(color, 1.0);
}