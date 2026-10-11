#version 300 es
precision highp float;
in vec2 uv;
out vec4 color;
uniform sampler2D camera;
uniform sampler2D fogMask;
uniform sampler2D revealImage;
uniform float revealMode;
uniform vec2 resolution;
uniform vec2 videoSize;
uniform float cameraMix;
uniform float time;
uniform float seed;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7))+seed)*43758.5453);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p); f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+1.),f.x),f.y);}
vec3 room(vec2 p){
 vec3 c=mix(vec3(.16,.22,.24),vec3(.65,.62,.64),smoothstep(0.,1.,p.y));
 float windowLight=exp(-pow((p.x-.28)*3.8,2.)-pow((p.y-.63)*1.9,2.));
 c+=vec3(.24,.23,.20)*windowLight;
 float frame=exp(-pow((p.x-.19)*100.,2.))+exp(-pow((p.x-.45)*100.,2.));
 c-=frame*.05*windowLight;
 float amber=exp(-length((p-vec2(.82,.44))*vec2(5.,2.8)));
 c+=vec3(1.,.55,.35)*amber*.26;
 c*=1.-.20*exp(-pow((p.y-.18)*32.,2.));
 return c;
}
vec3 feed(vec2 p,float fog){
 float screenAspect=resolution.x/resolution.y;
 float videoAspect=videoSize.x/videoSize.y;
 vec2 crop=vec2(min(1.,screenAspect/videoAspect),min(1.,videoAspect/screenAspect));
 vec2 q=(p-.5)*crop+.5; q.x=1.-q.x;
 vec2 d=(.5+fog*14.)/videoSize;
 vec3 c=texture(camera,q).rgb*.4;
 c+=texture(camera,q+vec2(d.x,d.y)).rgb*.15;
 c+=texture(camera,q-vec2(d.x,d.y)).rgb*.15;
 c+=texture(camera,q+vec2(d.x,-d.y)).rgb*.15;
 c+=texture(camera,q+vec2(-d.x,d.y)).rgb*.15;
 c.r=mix(c.r,texture(camera,q+vec2(d.x*.18,0)).r,fog*.07);
 return c;
}
void main(){
 vec3 mask=texture(fogMask,uv).rgb;
 float fog=mask.r;
 vec2 texel=1./vec2(textureSize(fogMask,0));
 vec2 grad=vec2(texture(fogMask,uv+vec2(texel.x,0)).r-texture(fogMask,uv-vec2(texel.x,0)).r,
 texture(fogMask,uv+vec2(0,texel.y)).r-texture(fogMask,uv-vec2(0,texel.y)).r);
 vec2 glass=uv*vec2(resolution.x/resolution.y,1.);
 vec2 cell=floor(glass*210.), local=fract(glass*210.)-.5;
 vec2 offset=vec2(hash(cell),hash(cell+17.))*.45-.225;
 float bead=length((local-offset)*vec2(1.,.85));
 float wet=mask.g*smoothstep(.4,.9,hash(cell+71.));
 float rim=exp(-pow((bead-.16)*38.,2.))*wet;
 vec2 refract=grad*.014+(local-offset)*rim*.0015;
 vec2 q=clamp(uv+refract,0.,1.);
 vec3 c=mix(room(q),feed(q,fog),cameraMix);
 c=mix(c,texture(revealImage,q).rgb,revealMode);
 float clouds=.82+.18*noise(glass*8.)+.06*noise(glass*34.);
 vec3 frost=mix(vec3(.56,.64,.68),vec3(.86,.87,.87),uv.y);
 float opacity=(1.-exp(-fog*2.5))*clouds;
 c=mix(c,frost,clamp(opacity,0.,.95));
 c+=rim*.038*(local.y>offset.y?1.:-.5);
 c+=length(grad)*.09*vec3(.85,.91,1.);
 c+=mask.b*.10*vec3(.8,.89,.94);
 float bloom=exp(-length((uv-vec2(.78+.025*sin(time*.09),.65))*vec2(5.,3.)));
 c+=vec3(1.,.64,.42)*bloom*.045*(.3+fog);
 float vignette=smoothstep(.18,.82,length((uv-.5)*vec2(1.,.85)));
 c*=1.-vignette*.18;
 c+=(hash(gl_FragCoord.xy+mod(time,100.)*.73)-.5)*.014;
 color=vec4(c,1.);
}
