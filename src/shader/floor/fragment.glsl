
uniform sampler2D uReflectionTexture;

varying vec4 vReflectionUV;

void main() {
    vec2 reflectionUv           = vReflectionUV.xy / vReflectionUV.w;
    vec4 reflectionTextureColor = texture2D(uReflectionTexture, reflectionUv);


    gl_FragColor = reflectionTextureColor;
}