varying vec2 vUv;

uniform float uTime;

vec2 rotateUV(vec2 uv, float angle) {
  mat2 m = mat2(
    cos(angle), -sin(angle),
    sin(angle), cos(angle)
  );

  return uv * m;
}

void main(){
  vec3 color  = vec3(1.0);
  vec2 uv     = vUv;
  vec2 center = vec2(0.5);

  uv *= 20.0;
  uv = fract(uv);

  uv -= center;
  uv = rotateUV(uv, uTime);
  uv += center;

  if(uv.x > 0.4 && uv.x < 0.6) {
    color = vec3(uv, 1.0);
  }else {
    discard;
  }

  gl_FragColor = vec4(color, 1.0);
}