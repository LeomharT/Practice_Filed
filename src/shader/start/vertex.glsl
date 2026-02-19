precision mediump float;
varying vec3 vPosition;
varying vec2 vUv;

uniform float uTime;

void main(){
    vec4 modelPosition      = instanceMatrix * vec4(position, 1.0);
    vec4 viewPosition       = viewMatrix * modelPosition;
    vec4 projectionPosition = projectionMatrix * viewPosition;

    gl_Position = projectionPosition;

    vPosition = modelPosition.xyz;
    vUv       = uv;
}