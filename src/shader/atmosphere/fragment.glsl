varying vec3 vPosition;
varying vec3 vNormal;

uniform vec3 uSunDirection;
uniform vec3 uAtmosphereTwilightColor;
uniform vec3 uAtmosphereDayColor;


void main(){
    vec3  color         = vec3(0.0);
    vec3  normal        = normalize(vNormal);
    vec3  viewDirection = normalize(vPosition - cameraPosition);
    float alpha         = 1.0;

    vec3  sunDirection   = uSunDirection;
    float sunOrientation = dot(sunDirection, normal);

    float atmosphereMix = smoothstep(-0.5, 1.0, sunOrientation);

    vec3 atmosphereColor = mix(
        uAtmosphereTwilightColor,
        uAtmosphereDayColor,
        atmosphereMix
    );
    
    color = atmosphereColor;

    float edgeAlpha = dot(viewDirection, vPosition);
          edgeAlpha = smoothstep(0.0, 0.5, edgeAlpha);

    float dayAlpha = smoothstep(-0.5, 0.0, sunOrientation);

    alpha = dayAlpha * edgeAlpha;

    gl_FragColor = vec4(color, alpha);

    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}