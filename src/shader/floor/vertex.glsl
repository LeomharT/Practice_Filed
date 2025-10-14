uniform mat4 uTextureMatrix;

varying vec4 vReflectionUv;

void main() {
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

    // Varying
    vReflectionUv = uTextureMatrix * vec4(position, 1.0);
}