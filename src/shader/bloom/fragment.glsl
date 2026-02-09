varying vec2 vUv;

uniform sampler2D uDiffuseColor;
uniform sampler2D uBloomTexture;

void main(){
    vec2 uv    = vUv;
    vec3 color = vec3(0.0);

    vec4 baseColor  = texture2D(uDiffuseColor, uv);
    vec4 bloomColor = texture2D(uBloomTexture, uv);

    color = baseColor.rgb + 1.0 * bloomColor.rgb;

    gl_FragColor = vec4(color, 1.0);
}