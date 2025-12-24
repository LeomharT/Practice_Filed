uniform sampler2D uSceneTexture;

varying vec2 vUv;
varying vec3 vNDC;


void main() {
    vec3 color = vec3(1.0);
    vec2 uv    = vUv;
    vec3 ndc   = vNDC;
 
    float dist = distance(uv, vec2(0.5));

    if(dist > 0.5) discard;

    float strength     = dist / 0.5;
    float distortion   = pow(strength, 2.0);
    vec2  distortedNDC = mix(ndc.xy, vec2(0.5), distortion * 0.2);
    vec4  sceneColor   = texture2D(uSceneTexture, distortedNDC);

    color = sceneColor.rgb;

    gl_FragColor = vec4(color, 1.0);

    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}