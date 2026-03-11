uniform float uTime;

varying vec3 vNormal;

vec2 rotate2D(vec2 _p, float _angle)
{
    mat2 _m = mat2(
        cos(_angle), -sin(_angle),
        sin(_angle), cos(_angle)
    );
    return _p * _m;
}

void main() {
    float shift = 0.01;

    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    vec3 positionA     = modelPosition.xyz + vec3(shift, 0, 0);
    vec3 positionB     = modelPosition.xyz + vec3(0, 0, -shift);

    modelPosition.y += cos((modelPosition.x + uTime) * 5.0) * 0.3;
    positionA.y     += cos((positionA.x + uTime) * 5.0) * 0.3;
    positionB.y     += cos((positionB.x + uTime) * 5.0) * 0.3;

    modelPosition.y += cos((modelPosition.z + uTime) * 3.0) * 0.3;
    positionA.y     += cos((positionA.z + uTime) * 3.0) * 0.3;
    positionB.y     += cos((positionB.z + uTime) * 3.0) * 0.3;

    vec3 toA = normalize(positionA - modelPosition.xyz);
    vec3 toB = normalize(positionB - modelPosition.xyz);

    vec3 N = cross(toA, toB);

    vec4 modelNormal        = modelMatrix * vec4(N, 0.0);
    vec4 viewPosition       = viewMatrix * modelPosition;
    vec4 projectionPosition = projectionMatrix * viewPosition;

    gl_Position = projectionPosition;

    vNormal = modelNormal.xyz;
}
