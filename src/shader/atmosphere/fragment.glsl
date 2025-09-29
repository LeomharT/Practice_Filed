varying vec3 vPosition;
varying vec3 vNormal;

uniform vec3 uSunDirection;

uniform vec3 uAtmosphereDayColor;
uniform vec3 uAtmosphereTwilightColor;

void main() {
    vec3 color         = vec3(0.0);
    vec3 normal        = normalize(vNormal);
    vec3 viewDirection = normalize(vPosition - cameraPosition);


    // Sun orientation
    vec3  sunDirection   = uSunDirection;
    float sunOrientation = dot(sunDirection, normal);

    // Amosphere
    float atmosphereMix = smoothstep(-0.5, 1.0, sunOrientation);
    vec3 atmosphereColor = mix(
        uAtmosphereTwilightColor,
        uAtmosphereDayColor,
        atmosphereMix
    );
    color = atmosphereColor;

    float alpha = 0.0;

    // Edge alpha
    float edgeAlpha = dot(viewDirection, normal);
    edgeAlpha = smoothstep(0.0, 0.5, edgeAlpha);

    // Day alpha
    float dayAlpha = smoothstep(-0.5, 0.0, sunOrientation);

    alpha = edgeAlpha * dayAlpha;

    gl_FragColor = vec4(color, alpha);

    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}