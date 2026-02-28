precision mediump float;

varying vec3 vPosition;
varying vec3 vNormal;

uniform float uTime;

void main(){
    vec3 color         = vec3(0.0);
    vec3 normal        = normalize(vNormal);
    vec3 viewDirection = normalize(vPosition - cameraPosition);
    vec3 afar          = vec3(-1.0, 0.0, -1.0);

    afar.x = cos(uTime * 2.0);
    afar.z = sin(uTime * 2.0);

    afar = normalize(afar);

    float fresnel = 1.0 + dot(viewDirection, normal);
          fresnel = max(0.0, fresnel);
          fresnel = pow(fresnel, 2.0);

    vec3  reflection = reflect(-afar, normal);
    float specular   = -dot(reflection, viewDirection);
          specular   = max(0.0, specular);
          specular = pow(specular, 20.0);

    vec3 edgeColor  = mix(
        vec3(1.0),
        vec3(0.96, 0.28, 0.54),
        fresnel
    );

    color = specular * edgeColor;
    
    gl_FragColor = vec4(color, 1.0);

    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}