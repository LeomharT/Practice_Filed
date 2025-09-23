#include <simplex3DNoise>

varying vec3 vPosition;

uniform float uFrequency;
uniform float uProgress;

uniform vec3 uColor;


void main() {

    vec3  color     = uColor;
    float edgeWidth = 0.08;
    
    vec3 dsiilutionColor = vec3(1.0, 0.05, 0.0);
    dsiilutionColor *= 4.0;

    float noise = snoise(vPosition * uFrequency);

    if(noise < uProgress) discard;

    if(noise > uProgress && noise < uProgress + edgeWidth) {
        color = dsiilutionColor;
    }

    gl_FragColor = vec4(color, 1.0);

    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}