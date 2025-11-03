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

void main() {
    #include <begin_vertex>

    vec3 billboardPos = billboard(transformed, modelViewMatrix);
    transformed = billboardPos;

    #include <project_vertex>

    vec4 worldPosition = instanceMatrix * vec4(position, 1.0);
    vec2 direction     = normalize(vec2(-1.0, 1.0));

    float time = uTime * 1.0;

    vec2  noiseUv1 = worldPosition.xy * 0.06 + direction * time * 0.1;
    noiseUv1 = fract(noiseUv1);
    float noise1   = texture2D(uNoiseTexture, noiseUv1).r - 0.5;
 
    vec2  noiseUv2 = worldPosition.xy * 0.043 + direction * time * 0.03;
    noiseUv2 = fract(noiseUv2);
    float noise2   = texture2D(uNoiseTexture, noiseUv1).r;

    float instance = noise1 * noise2;

    float distanceToBottom = distance(0.0, uv.y);
  
    gl_Position.x += (direction * instance).x * distanceToBottom;
 
    vUv       = uv;
    vPosition = worldPosition.xyz;
}