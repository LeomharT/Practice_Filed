
varying vec3 vPosition;
varying vec2 vUv;
varying vec3 vNormal;

uniform float uCloudVolumn;
uniform vec3 uSunDirection;
uniform vec3 uAtmosphereTwilightColor;
uniform vec3 uAtmosphereDayColor;
uniform sampler2D uDayMapTexture;
uniform sampler2D uNightMapTexture;
uniform sampler2D uSpecularCloudTexture;

void main(){
    vec2 uv            = vUv;
    vec3 normal        = normalize(vNormal);
    vec3 color         = vec3(0.0);
    vec3 viewDirection = normalize(vPosition - cameraPosition);

    vec3  sunDirection   = uSunDirection;
    float sunOrientation = dot(sunDirection, normal);

    vec4 dayMapColor        = texture2D(uDayMapTexture, uv);
    vec4 nightMapColor      = texture2D(uNightMapTexture, uv);
    vec4 specularCloudColor = texture2D(uSpecularCloudTexture, uv);

    // Texture
    float dayMix = smoothstep(-0.25, 0.5, sunOrientation);
    color = mix(
        nightMapColor.rgb,
        dayMapColor.rgb,
        dayMix
    );

    // Cloud
    float cloudMix = smoothstep(uCloudVolumn, 1.0, specularCloudColor.g);

    color = mix(
        color,
        vec3(1.0),
        cloudMix * dayMix
    );

    // Fresnel
    float fresnel = 1.0 + dot(viewDirection, normal);
          fresnel = max(0.0, fresnel);
          fresnel = pow(fresnel, 2.0);

    // Atmosphere
    float atmosphereMix = smoothstep(-0.5, 1.0, sunOrientation);

    vec3 atmosphereColor = mix(
        uAtmosphereTwilightColor,
        uAtmosphereDayColor,
        atmosphereMix
    );

    color = mix(
        color,
        atmosphereColor,
        fresnel * dayMix
    );

    // Specular
    vec3  reflector = reflect(-sunDirection, normal);
    float specular  = -dot(viewDirection, reflector);
          specular  = max(0.0, specular);
          specular  = pow(specular, 20.0);

    vec3 specularColor = mix(
        vec3(1.0),
        uAtmosphereTwilightColor,
        fresnel
    );

    color += specular * specularColor * specularCloudColor.r;

    gl_FragColor = vec4(color, 1.0);

    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}