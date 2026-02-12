varying vec3 vPosition;

void main(){
    #include <begin_vertex>
    #include <project_vertex>

    vec4 modelPosition = modelMatrix * vec4(position, 1.0);

    // Varying
    vPosition = modelPosition.xyz;
}