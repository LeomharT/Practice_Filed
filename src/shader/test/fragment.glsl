varying vec3 vPosition;
varying vec3 vNormal;

uniform float uFrequency;
uniform float uProgress;
uniform vec3 uSunDirection;

#include <simplex3DNoise>

void main(){
    vec3 color        = vec3(1.0);
    vec3 normal       = normalize(vNormal);
    vec3 sunDriection = uSunDirection;

    float light = dot(sunDriection, normal);
 
    color = vec3(light);
 
    float noise = snoise(vPosition * uFrequency);
          // Normalize noise
          noise = (noise + 1.0) / 2.0; 

    if(noise < uProgress) discard;

    float colorMix = step(noise, uProgress + 0.05);
    colorMix *= max(light, 0.5);

    if(uProgress > 0.0) {
        color = mix(
            color,
            vec3(1.0, 0.0, 0.0),
            colorMix
        );
    }

    gl_FragColor = vec4(color, 1.0);

    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}
