
uniform sampler2D uFrame;
uniform sampler2D uNormalMapRain;

varying vec2 vNdc;
varying vec2 vUv;
varying vec3 vPosition;
 
void main() {
    vec3 color         = vec3(0.24, 0.33, 0.33);
    vec2 uv            = vUv;
    vec2 ndc           = vNdc;
    vec2 center        = vec2(0.5);

    // Texture color
    vec4 _mapN        = texture2D(uNormalMapRain, uv) * 2.0 - 1.0;
    vec4 diffuseColor = texture2D(uFrame, ndc);

    if(_mapN.a < 0.0) discard;

    // Fresnel
    float fresnel = distance(center, uv) + 0.5;
    fresnel = pow(fresnel, 2.0);
    fresnel = 1.0 - fresnel;

    color = diffuseColor.rgb * fresnel;

    gl_FragColor = vec4(color, 1.0);
}