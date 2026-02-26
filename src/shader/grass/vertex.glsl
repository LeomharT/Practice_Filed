precision lowp float;

varying vec2 vUv;
varying vec3 vPosition;

vec3 billboardToCenter(vec3 localPos)
{
    vec3 center = vec3(0.0, 0.0, 0.0);

    // 草实例在世界中的位置
    vec3 worldOrigin = (instanceMatrix * vec4(0.0,0.0,0.0,1.0)).xyz;

    vec3 toCamera = normalize(cameraPosition - worldOrigin);
    vec3 toCenter = normalize(center - worldOrigin);

    toCamera.y = 0.0;
    toCenter.y = 0.0;

    toCamera = normalize(toCamera);
    toCenter = normalize(toCenter);
    vec3 cameraDir = -vec3(
        viewMatrix[0][2],
        viewMatrix[1][2],
        viewMatrix[2][2]
    );
    float topDown = dot(cameraDir, vec3(0.0,-1.0,0.0));
    float blend   = smoothstep(0.6, 1.9, topDown);

    vec3 forward =  normalize(mix(toCamera, toCenter, blend));

    // 世界up
    vec3 worldUp = vec3(0.0,1.0,0.0);

    // 构造正交基
    vec3 right = normalize(cross(worldUp, forward));
    vec3 up    = cross(forward, right);

    // billboard变换
    return right * localPos.x +
           up    * localPos.y;
}

void main(){
    #include <begin_vertex>

    vec4 modelPosition = instanceMatrix * vec4(position, 1.0);
    vec3 lookDir = normalize(vec3(0.0) - modelPosition.xyz);

    vec3 billboardPos = billboardToCenter(transformed);
         transformed  = billboardPos;

    #include <project_vertex>

    // Varying
    vUv       = uv;
    vPosition = position;
}