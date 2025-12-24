uniform sampler2D uDiffuse;

varying vec4 vTextureMatrix;

void main(){
    vec3 color = vec3(0.265, 0.458, 0.722);

    vec2 reflectUv = vTextureMatrix.xy / vTextureMatrix.w;

    vec4 reflectionColor = texture2D(uDiffuse, reflectUv);

    color += reflectionColor.rgb;

    gl_FragColor = vec4(color, 1.0);
    
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}