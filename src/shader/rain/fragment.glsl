uniform sampler2D uScreenTexture;

varying vec2 vScreenSpace;

void main() {
    vec4 screenTextureColor = texture2D(uScreenTexture,vScreenSpace);
    vec3 color = screenTextureColor.rgb;

    gl_FragColor = vec4(color, 1.0);
}