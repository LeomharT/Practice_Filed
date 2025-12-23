uniform sampler2D uSceneTexture;

varying vec2 vUv;
varying vec3 vNDC;


void main() {
    vec3 color = vec3(1.0);
    vec2 uv    = vUv;
    vec3 ndc   = vNDC;
 
    float distanceToCenter = distance(uv, vec2(0.5));

    if(distanceToCenter > 0.5) discard;

    vec4 sceneColor = texture2D(uSceneTexture, ndc.xy);

    color = sceneColor.rgb;

    gl_FragColor = vec4(color, 1.0);
}