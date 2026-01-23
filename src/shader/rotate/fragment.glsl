varying vec2 vUv;

uniform float uTime;

vec2 rotate2D(vec2 v, float angle) {
    mat2 m = mat2(
        cos(angle), -sin(angle),
        sin(angle), cos(angle)
    );
    return m * v;
}

void main(){
    vec2 uv     = vUv;
    vec3 color  = vec3(1.0);
    vec2 center = vec2(0.5);

    vec3 color1 = vec3(0.98, 0.85, 0.07);
    vec3 color2 = vec3(0.07, 0.70, 0.76);

    uv -= center;
    uv = rotate2D(uv, uTime);
    uv += center;
    
    color = mix(
        color1,
        color2,
        uv.x
    );

    gl_FragColor = vec4(color, 1.0);   
}