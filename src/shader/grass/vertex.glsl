varying vec2 vUv;
varying vec3 vPosition;

uniform float uTime;
uniform sampler2D uNoiseTexture;
 
vec3 billboard(vec3 v,mat4 view){
    vec3 up=vec3(view[0][1],view[1][1],view[2][1]);
    up.x = 0.0;
    up.z = 0.0;
    vec3 right=vec3(view[0][0],view[1][0],view[2][0]);
    vec3 pos=right*v.x+up*v.y;
    return pos;
}

vec2 getWind(sampler2D noiseTexture, vec3 worldPosition) {
    float time = uTime;

    vec2 direction = vec2(
        -1.0,
        1.0
    );
    direction = normalize(direction);

    vec2  noiseUv1 = worldPosition.xy * 0.06 + direction * time * 0.1;
    float noise1   = texture2D(noiseTexture, noiseUv1).r - 0.5;

    vec2  noiseUv2 = worldPosition.xy * 0.043 + direction * time * 0.03;
    float noise2   = texture2D(noiseTexture, noiseUv2).r;

    float intensity = noise1 * noise2;

    return direction * intensity;
}

void main() {
    #include <begin_vertex>

    vec3 billboardPos = billboard(transformed, modelViewMatrix);
    transformed = billboardPos;

    #include <project_vertex>

    vec4 worldPosition = instanceMatrix * vec4(position, 1.0);

    float distanceToBottom = distance(0.0, uv.y);
    vec2  wind             = getWind(uNoiseTexture, worldPosition.xyz);
  
    gl_Position.x = gl_Position.x + distanceToBottom * wind.x;
 
    vUv       = uv;
    vPosition = worldPosition.xyz;
}