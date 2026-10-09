#version 300 es
precision highp float;
in vec2 uv;
out vec4 result;
uniform sampler2D previous;
uniform float dt;
uniform float breath;
uniform vec2 from;
uniform vec2 to;
uniform float drawing;
uniform float aspect;
void main(){
 vec2 p=uv*vec2(aspect,1.),a=from*vec2(aspect,1.),b=to*vec2(aspect,1.);
 vec2 ab=b-a;
 float d=length(p-a-ab*clamp(dot(p-a,ab)/max(dot(ab,ab),.000001),0.,1.));
 vec2 old=texture(previous,uv).rg;
 float edge=smoothstep(.15,.72,length(uv-.5));
 float uneven=.85+.15*sin(uv.x*21.)*sin(uv.y*17.);
 float reservoir=max(0.,old.g-dt*(.002+.009*edge)*uneven);
 float deposition=breath*(1.-.55*edge)*1.5*dt;
 reservoir=1.-(1.-reservoir)*exp(-deposition);
 float fog=mix(old.r,reservoir,1.-exp(-dt/3.2));
 fog=1.-(1.-fog)*exp(-deposition);
 float wipe=(1.-smoothstep(.023,.042,d))*drawing;
 fog*=1.-wipe;
 result=vec4(clamp(fog,0.,1.),reservoir,0.,1.);
}
