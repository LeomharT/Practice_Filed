varying vec3 vPosition;

void main(){
    vec3 color = vec3(vPosition + 0.5);

    gl_FragColor = vec4(color, 1.0);
    
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}