precision mediump float;
varying vec3 vPosition;
varying vec2 vUv;
varying float vGradient;

uniform float uTime;

#include <fog_pars_vertex>

void main(){
    float h = position.z;

    vec4 modelPosition      = instanceMatrix * vec4(position, 1.0);
    vec4 viewPosition       = viewMatrix * modelPosition;
    vec4 projectionPosition = projectionMatrix * viewPosition;

    gl_Position = projectionPosition;
    #include <fog_vertex>

    vPosition = modelPosition.xyz;
    vUv       = uv;
    vGradient = (h + 5.0) / 10.0;
}