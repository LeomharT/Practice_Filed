varying vec2 vUv;

uniform float uTime;

vec2 rotateUV(vec2 v,float a) {
  mat2 m = mat2(
    cos(a), -sin(a),
    sin(a), cos(a)
  );

  return m * v;
}

void main(){
  vec4 modelPosition = modelMatrix * vec4(position, 1.0);

  modelPosition.xy = rotateUV(modelPosition.xy, uTime);

  vec4 viewPosition     = viewMatrix * modelPosition;
  vec4 projectionMatrix = projectionMatrix * viewPosition;

  gl_Position = projectionMatrix;

  // Varying
  vUv = uv;
}
