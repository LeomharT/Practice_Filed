varying vec3 vPosition;

void main(){

    vec4 modelPosition = modelMatrix * vec4(position, 1.0);

    // Varying
    vPosition = modelPosition.xyz;
}