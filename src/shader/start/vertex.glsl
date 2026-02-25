precision mediump float;
varying vec2 vUv;
varying float vGradient;

uniform float uTime;

attribute float aOffset;

#include <fog_pars_vertex>

float rand(float x) {
    return fract(sin(x) * 43758.5453123);
}

void main(){
    float h    = position.z;
    float seed = rand(float(gl_InstanceID));
          seed = max(0.5, seed);

    #include <begin_vertex>

    float total = uTime * seed * 20.0 + aOffset;
    float loop  = mod(total, 150.0) - 150.0 / 2.0;
    
    transformed.z *= rand(float(gl_InstanceID));
    transformed.z += loop;


    #include <project_vertex>
    #include <fog_vertex>

    vUv       = uv;
    vGradient = (h + 5.0) / 10.0;
}