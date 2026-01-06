varying vec2 vUv;
varying vec3 vPosition;

uniform float uTime;

#include <simplex3DNoise>

void main(){
    vec2 uv = vUv;

    float noise = snoise(vPosition * 10.0) + 1.0;
 
    float r = uv.x + uTime * 0.5;
          r = fract(r);
          r = smoothstep(-1.5, 1.0, r);

    vec3 color = vec3(r);

    if(noise < mod(uTime * 0.1, 1.0) + 1.0) discard;
 
    gl_FragColor = vec4(color, 1.0);
}