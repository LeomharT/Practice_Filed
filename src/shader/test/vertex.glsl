varying vec3 vPosition;
varying vec3 vNormal;

#include <simplex4DNoise>

void main(){
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);

    float wobble = snoise(
        vec4(
            modelPosition.xyz,
            0.0
        )
    );

    modelPosition.xyz += wobble * normal;

    vec4 modelNormal        = modelMatrix * vec4(normal, 0.0);
    vec4 viewPosition       = viewMatrix * modelPosition;
    vec4 projectionPosition = projectionMatrix * viewPosition;

    gl_Position = projectionPosition;

    vPosition = modelPosition.xyz;
    vNormal   = modelNormal.xyz;
}