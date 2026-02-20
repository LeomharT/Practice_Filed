varying vec2 vUv;
varying float vGradient;
#include <fog_pars_fragment>

void main(){
    vec3  color  = vec3(1.0);
    vec2  center = vec2(0.5);
    vec2  uv     = vUv;
    float dist   = distance(uv, center);
    float alpha  = 0.1 / dist - 0.2;
 
    gl_FragColor = vec4(color, vGradient);
    
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
    #include <fog_fragment>
}