uniform sampler2D uReflectionTexture;
uniform sampler2D uNormalMapCustom;
uniform sampler2D uRoughnessMapCustom;

uniform float uNormalBias;

varying vec4 vReflectionUv;
varying vec2 vUv;

void main() {
    vec2 uv = vUv;
    uv *= 5.0;
    uv = fract(uv);

    vec3 _mapN = texture2D(uNormalMapCustom, uv).xyz * 2.0 - 1.0;
    vec4 _mapR = texture2D(uRoughnessMapCustom, uv);
    
    vec2  uvOffset  = _mapN.xy * uNormalBias;
    vec2  reflectUv = vReflectionUv.xy / vReflectionUv.w + uvOffset;
    float roughness = _mapR.r;

    vec4 reflectionTextureColor = texture2D(uReflectionTexture, reflectUv);

    csm_DiffuseColor.rgb = mix(
        csm_DiffuseColor.rgb,
        reflectionTextureColor.rgb,
        roughness
    );

    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}