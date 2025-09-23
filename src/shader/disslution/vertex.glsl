varying vec3 vPosition;

uniform float uTime;

#include <simplex4DNoise>

float getWobble(vec3 position) {
    vec3 warpedPosition = position;
    warpedPosition += snoise(vec4(
        position * 0.38,
        uTime * 0.12
    )) * 1.7;

    float wobble = snoise(vec4(
        // XYZ
        warpedPosition * 0.5,
        // W
        uTime * 0.4
    )) * 0.3;

    return wobble;
}

void main() {
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    vec4 modelNormal   = modelMatrix * vec4(normal, 0.0);

    float wobble = getWobble(position);
    vec3 displaced = position + wobble * normal;
    
    modelPosition = modelMatrix * vec4(displaced, 1.0);

    vec4 viewPosition       = viewMatrix * modelPosition;
    vec4 projectionPosition = projectionMatrix * viewPosition;

 
    gl_Position = projectionPosition;

    vPosition = modelPosition.xyz;
}