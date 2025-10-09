uniform mat4 uTextureMatrix;

varying vec4 vReflectionUV;
varying vec2 vUv;

#include <logdepthbuf_pars_vertex>

void main() {
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

    // Varying
    vReflectionUV = uTextureMatrix * vec4(position, 1.0);
    vUv           = uv;

    #include <logdepthbuf_vertex>
}