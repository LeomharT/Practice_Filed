varying vec2 vUv;

void main() {
    gl_Position = modelMatrix * viewMatrix * projectionMatrix * vec4(position, 1.0);

    // Varying
    vUv = uv;
}