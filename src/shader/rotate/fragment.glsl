varying vec2 vUv;
varying vec3 vNDC;

uniform float uTime;
uniform sampler2D uFrameTexture;

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
    vec3 ndc    = vNDC;

    vec3 color1 = vec3(0.811, 0.0745, 0.133);
    vec3 color2 = vec3(0.325, 0.113, 0.670);

    uv -= center;
    uv = rotate2D(uv, uTime * 2.0);
    uv += center;

    color = mix(
        color1,
        color2,
        uv.x
    );

    vec4 frameColor = texture2D(uFrameTexture, ndc.xy);

    color += frameColor.rgb;

    gl_FragColor = vec4(color, 1.0);

    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}