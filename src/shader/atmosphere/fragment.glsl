varying vec3 vPosition;
varying vec3 vNormal;

uniform vec3 uSunDirection;
uniform vec3 uAtmosphereDayColor;
uniform vec3 uAtmosphereTwilightColor;

void main(){
    vec3  color         = vec3(0.0);
    vec3  normal        = normalize(vNormal);
    vec3  viewDirection = normalize(vPosition - cameraPosition);
    float alpha         = 1.0;

    vec3  sunDirection   = uSunDirection;
    float sunOrientation = dot(sunDirection, normal);

    float atmosphereMix = smoothstep(-0.8, 1.0, sunOrientation);

    vec3 atmosphereColor = mix(
        uAtmosphereTwilightColor,
        uAtmosphereDayColor,
        atmosphereMix
    );
    color = atmosphereColor;

    float dayAlpha = smoothstep(-0.5, 0.0, sunOrientation);

    float fresnel = dot(viewDirection, normal);
    fresnel = smoothstep(0.0, 0.5, fresnel);
    
    alpha = dayAlpha * fresnel;

    gl_FragColor = vec4(color, alpha);

    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}