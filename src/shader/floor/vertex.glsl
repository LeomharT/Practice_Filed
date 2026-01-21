varying vec2 vUv;
varying vec4 vTextureUv;

uniform mat4 uTextureMatrix;

#include <fog_pars_vertex>

void main(){
    #include <begin_vertex>
    #include <project_vertex>
    #include <fog_vertex>
    
    vUv        = uv;
    vTextureUv = uTextureMatrix * vec4(position, 1.0);
}