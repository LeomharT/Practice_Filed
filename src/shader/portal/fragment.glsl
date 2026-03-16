varying vec3 vNormal;
varying vec2 vUv;
varying vec3 vNdc;

uniform sampler2D uDiffuseTexture;

void main(){
    vec3 color  = vec3(1.0);
    vec2 uv     = vUv;
    vec3 normal = normalize(vNormal);
    vec3 ndc    = vNdc;
 
    vec4 diffuseColor = texture2D(uDiffuseTexture, ndc.xy);

    color = diffuseColor.rgb;

    gl_FragColor = vec4(color, 1.0);

    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}