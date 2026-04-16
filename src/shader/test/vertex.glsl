varying vec3 vNormal;

void main() {
  float shift = 0.01;

  vec4 modelPosition = modelMatrix * vec4(position, 1.0);
  vec3 positionA     = modelPosition.xyz + vec3(shift, 0.0, 0.0);
  vec3 positionB     = modelPosition.xyz + vec3(0.0, 0.0, -shift);

  modelPosition.y += cos(modelPosition.x * 3.0);
  positionA.y     += cos(positionA.x * 3.0);
  positionB.y     += cos(positionB.x * 3.0);

  vec3 toA = normalize(positionA - modelPosition.xyz);
  vec3 toB = normalize(positionB - modelPosition.xyz);

  vec3 N = cross(toA, toB);

  vec4 modelNormal        = modelMatrix * vec4(N, 0.0);
  vec4 viewPosition       = viewMatrix * modelPosition;
  vec4 projectionPosition = projectionMatrix * viewPosition;

  gl_Position = projectionPosition;

  vNormal = modelNormal.xyz;
}
