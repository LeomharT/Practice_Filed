precision mediump float;

varying vec3 vNormal;
varying float vElevation;

uniform float uTime;

#include <simplex4DNoise>

void main(){
    float shift = 0.01;

    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    vec3 positionA     = modelPosition.xyz + vec3(shift, 0, 0);
    vec3 positionB     = modelPosition.xyz + vec3(0, 0, -shift);

    modelPosition.y += cos(modelPosition.x * 5.0 + uTime) * 0.5;
    positionA.y     += cos(positionA.x * 5.0 + uTime) * 0.5;
    positionB.y     += cos(positionB.x * 5.0 + uTime) * 0.5;

    modelPosition.y += sin(modelPosition.z * 2.0 + uTime) * 0.25;
    positionA.y     += sin(positionA.z * 2.0 + uTime) * 0.25;
    positionB.y     += sin(positionB.z * 2.0 + uTime) * 0.25;

    vec3 toA = normalize(positionA - modelPosition.xyz);
    vec3 toB = normalize(positionB - modelPosition.xyz);

    vec3 dNormal = cross(toA, toB);

    vec4 modelNormal        = modelMatrix * vec4(dNormal, 1.0);
    vec4 viewPosition       = viewMatrix * modelPosition;
    vec4 projectionPosition = projectionMatrix * viewPosition;

    gl_Position = projectionPosition;

    // Varing
    vNormal    = modelNormal.xyz;
    vElevation = modelPosition.y;
}