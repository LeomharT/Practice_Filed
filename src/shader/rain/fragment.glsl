varying vec2 vUv;
varying vec2 vScreenspace;

uniform sampler2D uFrameTexture;
uniform sampler2D uRainNormal;

void main(){
    vec2 uv     = vUv;
    vec3 color  = vec3(0.0);
    vec2 center = vec2(0.5);

    vec4 normalColor = texture2D(uRainNormal, uv);
    if(normalColor.a < 0.5) discard; 

    vec3 normal = normalize(normalColor.rgb);

    vec2 bgUv = vScreenspace + normal.xy * 0.05;

    vec4 frameColor = texture2D(uFrameTexture, bgUv);
    color = frameColor.rgb;

    gl_FragColor = vec4(color, 1.0);
}