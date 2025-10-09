varying vec2 vUv;

void main() {
    float gravity          = 2.0;
    vec2  center           = vec2(0.5);
    float distanceToCenter = distance(uv, center);
    float edgeWidth        = 0.05;
    float edge             = 0.5 - edgeWidth;

    vec3 displacement = position;

    if(distanceToCenter < edge) {
        displacement.z += pow(distanceToCenter * gravity, 2.0);
    }else{
        displacement.z += pow(edge * gravity, 2.0);
    }
 
    gl_Position = projectionMatrix * modelViewMatrix * vec4(displacement, 1.0);

    // Varying
    vUv = uv;
}