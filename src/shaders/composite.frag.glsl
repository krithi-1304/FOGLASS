#version 300 es
precision highp float;
in vec2 uv;
out vec4 color;
uniform sampler2D camera;
uniform vec2 resolution;
uniform vec2 videoSize;
uniform float cameraMix;
uniform float time;
uniform float seed;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7))+seed)*43758.5453);}
vec3 room(vec2 p){
 vec3 c=mix(vec3(.075,.16,.18),vec3(.43,.52,.55),smoothstep(0.,1.,p.y));
 float windowLight=exp(-pow((p.x-.28)*3.8,2.)-pow((p.y-.63)*1.9,2.));
 c+=vec3(.19,.21,.20)*windowLight;
 float frame=exp(-pow((p.x-.19)*100.,2.))+exp(-pow((p.x-.45)*100.,2.));
 c-=frame*.04*windowLight;
 float amber=exp(-length((p-vec2(.82,.44))*vec2(5.,2.8)));
 c+=vec3(1.,.55,.25)*amber*.32;
 c*=1.-.20*exp(-pow((p.y-.18)*32.,2.));
 return c;
}
vec3 feed(vec2 p){
 float screenAspect=resolution.x/resolution.y;
 float videoAspect=videoSize.x/videoSize.y;
 vec2 crop=vec2(min(1.,screenAspect/videoAspect),min(1.,videoAspect/screenAspect));
 vec2 q=(p-.5)*crop+.5;
 q.x=1.-q.x;
 vec2 d=.8/videoSize;
 vec3 c=texture(camera,q).rgb*.4;
 c+=texture(camera,q+vec2(d.x,d.y)).rgb*.15;
 c+=texture(camera,q-vec2(d.x,d.y)).rgb*.15;
 c+=texture(camera,q+vec2(d.x,-d.y)).rgb*.15;
 c+=texture(camera,q+vec2(-d.x,d.y)).rgb*.15;
 return c*vec3(.94,.99,1.);
}
void main(){
 vec3 c=mix(room(uv),feed(uv),cameraMix);
 float vignette=smoothstep(.18,.82,length((uv-.5)*vec2(1.,.85)));
 c*=1.-vignette*.24;
 c+=(hash(gl_FragCoord.xy+mod(time,100.)*.73)-.5)*.024;
 color=vec4(c,1.);
}
