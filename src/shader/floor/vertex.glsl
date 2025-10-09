varying vec2 vUv;

void main() {
    float gravity          = 2.0;
    vec2  center           = vec2(0.5);
    float distanceToCenter = distance(uv, center);
    float edgeWidth        = 0.01;
    float edge             = 0.5 - edgeWidth;

    vec3 displacementPosition = position;

    if(distanceToCenter < edge) {
        displacementPosition.z += pow(distanceToCenter * 2.0, 2.0);
    }else{
        displacementPosition.z += pow(edge * 2.0, 2.0);
    }
 
    gl_Position = projectionMatrix * modelViewMatrix * vec4(displacementPosition, 1.0);

    // Varying
    vUv = uv;
}