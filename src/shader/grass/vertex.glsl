precision lowp float;

varying vec2 vUv;
varying vec3 vPosition;

void main(){
    vec4 modelViewPosition  = modelViewMatrix * vec4(position, 1.0);
    vec4 projectionPosition = projectionMatrix * modelViewPosition;

    gl_Position = projectionPosition;

    // Varying
    vUv       = uv;
    vPosition = position;
}