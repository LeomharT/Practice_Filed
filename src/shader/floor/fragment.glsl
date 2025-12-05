varying vec2 vUv;

uniform float uTime;
uniform vec3 uWaveColor;
uniform vec3 uWaveColor2;

void main(){
    vec3 color  = vec3(1.0);

    gl_FragColor = vec4(color, 1.0);

    #include <colorspace_fragment>
    #include <tonemapping_fragment>
}