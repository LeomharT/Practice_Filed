varying vec3 vNormal;
varying vec2 vUv;
varying vec3 vPosition;

void main() {
    vec4 modelPosition      = modelMatrix * vec4(position, 1.0);
    vec4 modelNormal        = modelMatrix * vec4(normal, 0.0);
    vec4 viewPososition     = viewMatrix * modelPosition;
    vec4 projectionPosition = projectionMatrix * viewPososition;

    gl_Position = projectionPosition;

    // Varying
    vPosition = modelPosition.xyz;
    vNormal   = modelNormal.xyz;
    vUv       = uv;
}