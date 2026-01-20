varying vec2 vUv;
varying vec3 vNDC;

uniform float uRotateDeg;
uniform sampler2D uFrameTarget;

vec2 rotate(vec2 p, float angle) {
    mat2 m = mat2(
        cos(angle), -sin(angle),
        sin(angle), cos(angle)
    );
    return m * p;
}


void main(){
    vec3 ndc = vNDC;
    vec2 uv     = vUv;
    vec3 color  = vec3(1.0);
    vec2 center = vec2(0.5);
    float distanceToCenter = distance(vUv, center);

    uv -= center;
    uv = rotate(uv, uRotateDeg);
    uv += center;

    vec3 color1 = vec3(0.125, 0.758, 0.015);
    vec3 color2 = vec3(0.467, 0.158, 0.815);

    color = mix(
        color1,
        color2,
        uv.x
    );

    vec4 frameColor = texture2D(uFrameTarget, ndc.xy);
    if(distanceToCenter > 0.5) discard;

    color = frameColor.rgb;

    gl_FragColor = vec4(color, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}