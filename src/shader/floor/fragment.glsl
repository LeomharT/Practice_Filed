varying vec4 vReflectorUv;

uniform sampler2D uDiffuse;

void main(){
    vec3 color = vec3(0.0);

    vec4 reflectorColor = texture2DProj(uDiffuse, vReflectorUv);

    color = reflectorColor.rgb;

    gl_FragColor = vec4(color, 1.0);

    #include <colorspace_fragment>
    #include <tonemapping_fragment>
}