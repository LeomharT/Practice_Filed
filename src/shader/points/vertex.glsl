
varying vec2 vReflectionUv;

void main() {
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

    gl_PointSize = 50.0;

    vec2 ndc = gl_Position.xy / gl_Position.w;

    vReflectionUv = ndc * 0.5 + 0.5;
 }