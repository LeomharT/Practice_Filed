varying vec2 vUv;

uniform float uRotateDeg;

vec2 rotate(vec2 p, float angle) {
    mat2 m = mat2(
        cos(angle), -sin(angle),
        sin(angle), cos(angle)
    );
    return m * p;
}


void main(){
    vec2 uv    = vUv;
    vec3 color = vec3(1.0);

    uv -= vec2(0.5);
    uv = rotate(uv, uRotateDeg);
    uv += vec2(0.5);

    vec3 color1 = vec3(0.125, 0.758, 0.015);
    vec3 color2 = vec3(0.467, 0.158, 0.815);

    color = mix(
        color1,
        color2,
        uv.x
    );


    gl_FragColor = vec4(color, 1.0);
}