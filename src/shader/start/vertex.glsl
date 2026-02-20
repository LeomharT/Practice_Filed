precision mediump float;
varying vec2 vUv;
varying float vGradient;

uniform float uTime;

#include <fog_pars_vertex>

void main(){
    float h = position.z;

    #include <begin_vertex>
    #include <project_vertex>
    #include <fog_vertex>

    vUv       = uv;
    vGradient = (h + 5.0) / 10.0;
}