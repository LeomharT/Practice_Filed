
uniform sampler2D uBaseTexture;
uniform sampler2D uBloomTexture;

varying vec2 vUv;

void main() {
    vec2 uv = vUv;

    vec4 baseTextureColor = texture2D(uBaseTexture, uv);
    vec4 bloomTextureColor = texture2D(uBloomTexture, uv);

    gl_FragColor = baseTextureColor + vec4(1.0) * bloomTextureColor;
}