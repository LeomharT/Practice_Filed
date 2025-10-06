uniform sampler2D uReflectionTexture;
uniform sampler2D uNormalMapCustom;
uniform sampler2D uRoughnessMapCustom;

uniform float uNormalBias;
uniform float uTime;

varying vec4 vReflectionUv;
varying vec2 vUv;

void main() {
    vec2 uv = vUv;
    uv *= 5.0;
    uv = fract(uv);

    // Texture map
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

    // Grid
    vec2 girdUV = vUv;
    girdUV.y -= uTime * 0.00003;
    girdUV *= 15.0;
    girdUV = fract(girdUV);

    vec3  color     = vec3(0.0);
    float lineWidth = 0.003;

    if(girdUV.x < lineWidth || girdUV.x > 1.0 - lineWidth) {
        color = vec3(1.0);
    }
    if(girdUV.y < lineWidth || girdUV.y > 1.0 - lineWidth) {
        color = vec3(1.0);
    }
    

    csm_DiffuseColor.rgb += color;

    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}