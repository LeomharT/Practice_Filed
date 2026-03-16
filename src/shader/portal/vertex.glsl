precision mediump float;

varying vec3 vNormal;
varying vec2 vUv;
varying vec3 vNdc;

uniform float uTime;

#include <simplex4DNoise>

void main(){
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    
    vec4 modelNormal        = modelMatrix * vec4(normal, 1.0);
    vec4 viewPosition       = viewMatrix * modelPosition;
    vec4 projectionPosition = projectionMatrix * viewPosition;

    gl_Position = projectionPosition;

    vec3 ndc = gl_Position.xyz / gl_Position.w;

    // Varing
    vNormal = modelNormal.xyz;
    vUv     = uv;
    vNdc    = ndc * 0.5 + 0.5;
}