varying vec2 vUv;

uniform vec3 uRootColor;
uniform vec3 uGrassColor;

void main(){
    vec2 uv    = vUv;
    vec3 color = vec3(0.0);

    color = mix(
        uRootColor,
        uGrassColor,
        uv.y
    );

    gl_FragColor = vec4(color, 1.0);


    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}