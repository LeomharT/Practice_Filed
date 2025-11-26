uniform sampler2D uDiffuse;
uniform sampler2D uBloomTexture;

varying vec2 vUv;

void main(){
    vec2 uv    = vUv;

    vec4 diffuseColor      = texture2D(uDiffuse, uv);
    vec4 bloomTextureColor = texture2D(uBloomTexture, uv);

    gl_FragColor = diffuseColor + vec4(1.0) * bloomTextureColor;

    #include <colorspace_fragment>
    #include <tonemapping_fragment>
}