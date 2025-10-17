
uniform sampler2D uFrame;
uniform sampler2D uNormalMapRain;

varying vec2 vNdc;
varying vec2 vUv;
varying vec3 vPosition;
 
void main() {
    vec3 color  = vec3(0.28, 0.76, 0.36);
    vec2 uv     = vUv;
    vec2 ndc    = vNdc;
    vec2 center = vec2(0.5);

    // Texture color
    vec4 _mapN        = texture2D(uNormalMapRain, uv) * 2.0 - 1.0;
    vec4 diffuseColor = texture2D(uFrame, ndc);

    if(_mapN.a < 0.0) discard;

    // Fresnel
    float fresnel = distance(center, uv) + 0.5;
    fresnel = pow(fresnel, 2.0);
    fresnel = smoothstep(-1.5, 1.0, fresnel);
 
    color = diffuseColor.rgb * (fresnel + 0.3);

    gl_FragColor = vec4(color, 1.0);
}