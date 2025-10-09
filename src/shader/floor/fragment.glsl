
uniform sampler2D uReflectionTexture;

varying vec4 vReflectionUV;
varying vec2 vUv;

void main() {
    vec3 color = vec3(1.0);


    vec2 reflectionUv = vReflectionUV.xy / vReflectionUV.w;


    vec4 reflectionTextureColor = texture2D(uReflectionTexture, reflectionUv);


    gl_FragColor = reflectionTextureColor;
}