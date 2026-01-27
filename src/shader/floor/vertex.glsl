uniform mat4 uTextureMatrix;

varying vec2 vUv;
varying vec4 vTexturePosition;

void main(){
    #include <begin_vertex>
    #include <project_vertex>

    vUv              = uv;
    vTexturePosition = uTextureMatrix * vec4(position, 1.0);
}