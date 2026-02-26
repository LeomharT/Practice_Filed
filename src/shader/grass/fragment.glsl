varying vec2 vUv;
varying vec3 vPosition;

uniform float uTime;

vec2 rotateUv(vec2 uv, float angle) {
    mat2 m = mat2(
        cos(angle), -sin(angle),
        sin(angle), cos(angle)
    );
    return m * uv;
}

void main(){
    vec3 color  = vec3(0.0);
    vec2 uv     = vUv;
    vec2 center = vec2(0.5);

    uv -= center;
    uv  = rotateUv(uv, uTime);
    uv += center;

    color = vec3(uv, cos(uTime));

    gl_FragColor = vec4(color, 1.0);
}