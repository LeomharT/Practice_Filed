uniform sampler2D uDiffuseColor;
uniform sampler2D uBloomTexture;
varying vec2 vUv;

void main(){
    vec3 color = vec3(0.0);
    vec2 uv    = vUv;

    vec4 diffuseColor = texture2D(uDiffuseColor, uv);
    vec4 bloomColor   = texture2D(uBloomTexture, uv);

    color = diffuseColor.rgb + vec3(1.0) * bloomColor.rgb;

    gl_FragColor = vec4(color, 1.0);
}   