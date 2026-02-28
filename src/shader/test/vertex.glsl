varying vec3 vPosition;
varying vec3 vNormal;


void main(){
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    vec4 modelNormal   = modelMatrix * vec4(normal, 0.0);

    #include <begin_vertex>
    #include <project_vertex>

    vPosition = modelPosition.xyz;
    vNormal   = modelNormal.xyz;
}