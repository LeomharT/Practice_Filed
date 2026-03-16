varying vec3 vNormal;
varying float vElevation;

void main(){
    vec3 color        = vec3(1.0);
    vec3 normal       = normalize(vNormal);
    vec3 sunDirection = normalize(vec3(2.0, 2.0, 0.0));

    float light = dot(normal, sunDirection);
    light = smoothstep(-0.25, 1.0, light);

    color = vec3(light);

    gl_FragColor = vec4(color, 1.0);
}