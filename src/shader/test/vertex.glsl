precision highp float;

attribute vec4 tangent;

varying vec3 vPosition;
varying vec3 vNormal;

uniform float uTime;

#include <simplex4DNoise>

float getWobble(vec3 p) {
    vec3 wrapPosition = p;
    wrapPosition += snoise(vec4(
        p,
        uTime
    ));

    return snoise(
        vec4(
            wrapPosition * 0.5,
            uTime
        )
    ) * 0.3;
}

void main(){
    float shift     = 0.01;
    vec3  biTangent = cross(normal, tangent.xyz);

    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    vec3 positionA     = modelPosition.xyz + tangent.xyz * shift;
    vec3 positionB     = modelPosition.xyz + biTangent * shift;

    float wobble = getWobble(modelPosition.xyz);

    modelPosition.xyz += wobble * normal;
    positionA         += getWobble(positionA) * normal;
    positionB         += getWobble(positionB) * normal;

    vec3 toA = normalize(positionA - modelPosition.xyz);
    vec3 toB = normalize(positionB - modelPosition.xyz);

    vec3 N = cross(toA, toB);

    vec4 modelNormal        = modelMatrix * vec4(N, 0.0);
    vec4 viewPosition       = viewMatrix * modelPosition;
    vec4 projectionPosition = projectionMatrix * viewPosition;

    #ifdef IS_DEPTH_MATERIAL
    csm_Position += wobble * normal;
    #else
    gl_Position = projectionPosition;
    #endif

    vPosition = modelPosition.xyz;
    vNormal   = modelNormal.xyz;
}