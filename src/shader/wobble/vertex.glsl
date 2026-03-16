precision mediump float;

attribute vec4 tangent;

varying vec3 vNormal;

uniform float uTime;

#include <simplex4DNoise>

float getWobble(vec3 _p)
{
    return snoise(
        vec4(
            _p,
            uTime
        )
    ) * 0.3;
}

void main(){
    vec3 biTangent = cross(normal, tangent.xyz);

    float shift         = 0.01;
    vec4  modelPosition = modelMatrix * vec4(position, 1.0);
    vec3  positionA     = modelPosition.xyz + tangent.xyz * shift;
    vec3  positionB     = modelPosition.xyz + biTangent * shift;

    float wobble = getWobble(modelPosition.xyz);

    modelPosition.xyz += wobble * normal;
    positionA         += getWobble(positionA) * normal;
    positionB         += getWobble(positionB) * normal;

    vec3 toA = normalize(positionA - modelPosition.xyz);
    vec3 toB = normalize(positionB - modelPosition.xyz);

    vec3 dNormal = cross(toA, toB);

    vec4 modelNormal        = modelMatrix * vec4(dNormal, 1.0);
    vec4 viewPosition       = viewMatrix * modelPosition;
    vec4 projectionPosition = projectionMatrix * viewPosition;

    gl_Position = projectionPosition;

    // Varing
    vNormal = modelNormal.xyz;
}