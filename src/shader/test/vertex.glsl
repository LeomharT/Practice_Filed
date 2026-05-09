varying vec2 vUv;
varying vec3 vNDC;

uniform float uTime;

vec2 rotateUV(vec2 v,float a) {
  mat2 m = mat2(
    cos(a), -sin(a),
    sin(a), cos(a)
  );

  return m * v;
}

void main(){
  vec3 p = position;

  vec4 modelPosition = modelMatrix * vec4(vec3(0.0), 1.0);  
  vec4 viewPosition  = viewMatrix * modelPosition;

  p.xy            = rotateUV(p.xy, uTime);
  viewPosition.xy += p.xy;

  vec4 projectionPosition = projectionMatrix * viewPosition;

  gl_Position = projectionPosition;

  vec3 ndc = gl_Position.xyz / gl_Position.w;

  // Varying
  vUv  = uv;
  vNDC = ndc * 0.5 + 0.5;
}
