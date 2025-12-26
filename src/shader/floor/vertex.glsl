varying vec2 vUv;
varying float vFogDepth;
varying vec3 fogDensity;


void main(){
    #include <begin_vertex>
    #include <project_vertex>
    #include <fog_vertex>   
    vUv = uv;
}