varying vec3 vPosition;

void main() {
  #include <begin_vertex>
  vec4 modelPosition = modelMatrix * vec4(position, 1.0);
  #include <project_vertex>

  vPosition = modelPosition.xyz;
}
