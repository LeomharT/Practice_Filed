varying vec2 vUv;
varying vec2 vScreenspace;

uniform sampler2D uFrameTexture;


void main(){
    vec2 uv     = vUv;
    vec3 color  = vec3(0.0);
    vec2 center = vec2(0.5);

    float distanceToCenter = distance(uv, center);
    if(distanceToCenter > 0.5) discard;

    vec2 bgUv = vScreenspace * 1.0015;

    vec4 frameColor = texture2D(uFrameTexture, bgUv);
    color = frameColor.rgb;

    gl_FragColor = vec4(color, 1.0);
}