varying vec2 vUv;

uniform sampler2D uDiffuse;
uniform sampler2D uBloomTexture;

void main(){
    vec2 uv    = vUv;
    vec3 color = vec3(0.0);

    float offset = 0.0;

    float r    = texture2D(uDiffuse, uv - offset).r;
    float g    = texture2D(uDiffuse, uv).g;
    float b    = texture2D(uDiffuse, uv + offset).b;
    vec3  base = vec3(r, g, b);

    vec4 bloomColor = texture2D(uBloomTexture, uv);
    vec3 bloom      = bloomColor.rgb;

    color = base + vec3(1.0) * bloom;

    gl_FragColor = vec4(color, 1.0);

    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}