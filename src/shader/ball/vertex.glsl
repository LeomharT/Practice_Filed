varying vec3 vPosition;
varying vec3 vNormal;

void main(){
    #include <begin_vertex>
    #include <project_vertex>

    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    vec4 modelNormla   = modelMatrix * vec4(normal, 0.0);

    // Varying
    vPosition = modelPosition.xyz;
    vNormal   = modelNormla.xyz;
}