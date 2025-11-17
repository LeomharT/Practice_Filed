precision mediump float;

varying vec3 vPosition;

uniform float uProgress;
uniform float uFrequency;
uniform float uIntensity;

uniform vec3 uBasicColor;
uniform vec3 uDisslutionColor;

#include <simplex3DNoise>

void main(){
    vec3  color     = uBasicColor * 5.25;
    float edgeWidth = 0.1;

    float noise = snoise(vPosition * uFrequency);
 
    if(noise < uProgress) discard;

    if(noise < uProgress + edgeWidth) {
        color = uDisslutionColor * uIntensity;
        csm_Metalness = 0.0;
        csm_Roughness = 1.0;
    }

    csm_DiffuseColor = vec4(color, 1.0);
}