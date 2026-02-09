varying vec3 vPosition;
varying vec2 vUv;

void main() {
  vec4 modelPosition = modelMatrix * vec4(position, 1.0);

  #include <begin_vertex>
  #include <project_vertex>

  // Varying
  vPosition = modelPosition.xyz;
  vUv       = uv;
}
