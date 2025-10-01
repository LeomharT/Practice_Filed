uniform sampler2D uReflectionTexture;

varying vec4 vReflectionUv;
varying vec2 vUv;

void main() {

    vec4 reflectionTextureColor = texture2DProj(uReflectionTexture, vReflectionUv);


    csm_DiffuseColor += vec4(reflectionTextureColor.rgb, 1.0);
}