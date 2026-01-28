varying vec3 vPosition;
varying vec2 vUv;
varying vec3 vNormal;


void main(){
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    vec4 modelNormal   = modelMatrix * vec4(normal, 0.0);

    #include <begin_vertex>
    #include <project_vertex>

    // Varying
    vPosition = modelPosition.xyz;
    vUv       = uv;
    vNormal   = modelNormal.xyz;
}