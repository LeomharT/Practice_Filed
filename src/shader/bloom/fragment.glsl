uniform sampler2D baseTexture;
uniform sampler2D bloomTexture;

varying vec2 vUv;


void main() {
    vec3 color = vec3(0.0);
    vec2 uv    = vUv;

    vec4 baseTextureColor = texture2D(baseTexture, uv);
    vec4 bloomTextureColor = texture2D(bloomTexture, uv);

    vec4 fragColor = mix(
        baseTextureColor,
        bloomTextureColor,
        0.1
    );

    fragColor = baseTextureColor + vec4(1.0) * bloomTextureColor;

    gl_FragColor = fragColor;
}