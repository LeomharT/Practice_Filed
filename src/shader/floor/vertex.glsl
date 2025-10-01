uniform mat4 uTextureMatrix;

varying vec4 vReflectionUv;
varying vec2 vUv;

#include <logdepthbuf_pars_vertex>

void main() {
    vReflectionUv = uTextureMatrix * vec4(position, 1.0);
    vUv           = uv;

    #include <logdepthbuf_vertex>
}