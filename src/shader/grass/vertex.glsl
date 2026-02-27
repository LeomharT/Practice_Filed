#define PI 3.1415926

precision lowp float;

varying vec2 vUv;
varying vec3 vPosition;

uniform float uTime;

vec2 rotate2D(vec2 v, float angle) {
    mat2 m = mat2(
        cos(angle), -sin(angle),
        sin(angle), cos(angle)
    );
    return v * m;
}
 

void main(){
    #include <begin_vertex>

    // 
    vec4 instancePosition = modelMatrix * instanceMatrix * vec4(vec3(0.0), 1.0);
    vec3 viewDirection    = normalize(cameraPosition - instancePosition.xyz);

    float angle          = atan(viewDirection.z, viewDirection.x);
    vec2  rotateXZ       = rotate2D(transformed.xz, angle - PI / 2.0);
          transformed.xz = rotateXZ;

    #include <project_vertex>

    // Varying
    vUv       = uv;
    vPosition = position;
}