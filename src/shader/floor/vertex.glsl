varying vec4 vReflectionUv;

uniform mat4 uTextureMatrix;


void main() {
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

    vReflectionUv = uTextureMatrix * vec4(position, 1.0);
}