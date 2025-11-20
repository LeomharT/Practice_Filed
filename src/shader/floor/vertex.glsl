varying vec4 vReflectorUv;
varying vec2 vUv;

uniform mat4 uTextureMatrix;

void main() {
    vec4 modelPosition      = modelMatrix * vec4(position, 1.0);
    vec4 viewPosition       = viewMatrix * modelPosition;
    vec4 projectionPosition = projectionMatrix * viewPosition;

    gl_Position = projectionPosition;

    // Varying
    vReflectorUv = uTextureMatrix * vec4(position, 1.0);
    vUv = uv;
}