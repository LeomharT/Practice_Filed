#define EDGE_WIDTH 0.25

uniform vec3 uColor;
uniform vec3 uEdgeColor;

uniform float uProgress;
uniform float uFrequency;

varying vec3 vPosition;

#include <simplex3DNoise>

void main(){
    vec3 color = uColor;

    float noise = snoise(vPosition * uFrequency);

    if(noise < uProgress) discard;

    if(noise < uProgress + EDGE_WIDTH && uProgress > -1.0) {
        color = uEdgeColor * 30.0;
    }

    gl_FragColor = vec4(color, 1.0);
}