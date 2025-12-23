uniform mat4 uTextureMatrix;

varying vec4 vTextureMatrix;

void main(){    
    #include <begin_vertex>

    #include <project_vertex>

    // Varying
    vTextureMatrix = uTextureMatrix * vec4(transformed, 1.0);
}