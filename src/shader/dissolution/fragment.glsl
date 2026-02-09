varying vec3 vPosition;

uniform float uFrequency;
uniform float uProgress;

#include <simplex3DNoise>

void main(){
    vec3  color         = vec3(0.0);
    vec3  worldPosition = vPosition;
    float edgeWidth     = 0.05;

    float noise  = snoise(worldPosition * uFrequency);
    noise = (noise + 1.0) / 2.0;

    if(noise < uProgress) discard;

    if(noise > uProgress && noise < uProgress + edgeWidth)
    {
        color = vec3(1.0, 0.738, 0.125);
    }

    gl_FragColor = vec4(color, 1.0);
}