varying vec3 vNormal;

#include <simplex2DNoise>

float getYPosition(vec2 v){
    float y = 2.0 * snoise(vec2(v.x / 50.0, v.y / 50.0));
    y += 4.0 * snoise(vec2(v.x / 40.0, v.y / 40.0));
    y += 0.2 * snoise(vec2(v.x / 10.0, v.y / 10.0));
    return y;
}

void main(){
    float shift = 0.01;

    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    vec3 positionA     = modelPosition.xyz + vec3(shift, 0, 0);
    vec3 positionB     = modelPosition.xyz + vec3(0, 0, -shift);

    modelPosition.y += getYPosition(modelPosition.xz);
    positionA.y     += getYPosition(positionA.xz);
    positionB.y     += getYPosition(positionB.xz);

    vec3 toA = normalize(positionA - modelPosition.xyz);
    vec3 toB = normalize(positionB - modelPosition.xyz);

    vec3 N = cross(toA, toB);

    vec4 modelNormal        = modelMatrix * vec4(N, 0.0);
    vec4 viewPosition       = viewMatrix * modelPosition;
    vec4 projectionPosition = projectionMatrix * viewPosition;

    gl_Position = projectionPosition;

    vNormal = modelNormal.xyz;
}