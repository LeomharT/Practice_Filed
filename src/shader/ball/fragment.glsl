varying vec3 vPosition;
varying vec3 vNormal;

uniform float uFrequency;
uniform float uProgress;
uniform vec3 uColor;
uniform vec3 uEdgeColor;
uniform vec3 uDirection;

#include <simplex3DNoise>

void main(){
    vec3 color  = uColor;
    vec3 normal = normalize(vNormal);

    float noise = snoise(vPosition * uFrequency);
          noise = noise * 0.5 + 0.5;

    if(noise < uProgress) discard;
    
    if(uProgress > 0.0 && noise > uProgress && noise < uProgress + 0.05) {
        color = 7.1 * uEdgeColor;
    }

    vec3 direction = uDirection;

    float orientation = dot(normal, direction);
          orientation = smoothstep(0.9, 2.85,orientation);

    color += vec3(orientation);

    gl_FragColor = vec4(color, 1.0);

    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}