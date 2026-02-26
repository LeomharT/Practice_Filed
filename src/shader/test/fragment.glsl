varying vec3 vPosition;
varying vec3 vNormal;

uniform vec3 uDirection;

void main(){
    vec3 color         = vec3(0.0);
    vec3 normal        = normalize(vNormal);
    vec3 viewDirection = normalize(vPosition - cameraPosition);

    vec3  direction   = uDirection;
    float orientation = dot(direction, normal);
          orientation = smoothstep(0.0, 1.6, orientation);

    float fresnel = dot(viewDirection, normal) + 1.0;
          fresnel = pow(fresnel, 2.0);

    vec3  reflection = reflect(-direction, normal);

    float specular = -dot(reflection, viewDirection);
          specular = max(0.0, specular);
          specular = pow(specular, 20.0);

    color  = vec3(orientation);
    color += vec3(specular) * vec3(0.0705, 0.24705, 0.9882);

    if(color.r < 0.1001) {
      color = mix(
        vec3(1.0, 0.0, 0.25),
        vec3(0.01, 1.0, 0.0257),
        fresnel
      );
    }

    gl_FragColor = vec4(color, 1.0);

    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}