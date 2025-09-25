precision highp float;

uniform vec3 uColor;
uniform float uProgress;
uniform float uFrequency;

varying vec3 vPosition;

#include <simplex3DNoise>

void main() {
    vec3  color     = uColor;
    float edgeWidth = 0.08;

    float noise = snoise(vPosition * uFrequency);

    if(noise < uProgress) {
        discard;
    }

    if(noise > uProgress && noise <= uProgress + edgeWidth) {
        color = vec3(5.0, 0.9, 0.0);
    }

    gl_FragColor = vec4(color, 1.0);
}