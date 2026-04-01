uniform vec3 uLightDirection;

varying vec3 vNormal;

void main(){
    vec3 color     = vec3(0.0);
    vec3 normal    = normalize(vNormal);
    vec3 direction = uLightDirection;

    float light = dot(normal, direction);

    color = light * vec3(0.785, 0.443, 0.126);

    gl_FragColor = vec4(color, 1.0);

    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}