varying vec2 vUv;

uniform float uTime;

vec2 rotate2D(vec2 p, float theta)
{
    mat2 m = mat2(
        cos(theta), -sin(theta),
        sin(theta), cos(theta)
    );

    return p * m;
}

void main(){
    #include <begin_vertex>

    transformed.xy = rotate2D(transformed.xy, uTime * 0.125);

    #include <project_vertex>

    // Varying
    vUv = uv;
}