varying vec3 vPosition;

uniform float uFrequency;
uniform float uProgress;
uniform vec3 uColor;
uniform vec3 uEdgeColor;

#include <simplex3DNoise>

void main(){
    vec3 color = uColor;

    float noise = snoise(vPosition * uFrequency);
          noise = noise * 0.5 + 0.5;

    if(noise < uProgress) discard;
    
    if(uProgress > 0.0 && noise > uProgress && noise < uProgress + 0.05) {
        color = uEdgeColor;
    }

    gl_FragColor = vec4(color, 1.0);

    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}