varying vec2 vUv;
#include <fog_pars_vertex>

void main(){
    #include <begin_vertex>
    #include <project_vertex>
    #include <fog_vertex>   
    vUv = uv;
}