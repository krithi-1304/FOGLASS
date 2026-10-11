#version 300 es
precision highp float;
in vec2 uv;
out vec4 result;
uniform sampler2D previous;
uniform float dt;
uniform float breath;
uniform float bloomRadius;
uniform vec2 from;
uniform vec2 to;
uniform float drawing;
uniform float aspect;
uniform float radius;
uniform float palm;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
void main(){
 vec2 p=uv*vec2(aspect,1.),a=from*vec2(aspect,1.),b=to*vec2(aspect,1.);
 vec2 ab=b-a;
 float d=length(p-a-ab*clamp(dot(p-a,ab)/max(dot(ab,ab),.000001),0.,1.));
 vec3 old=texture(previous,uv).rgb;
 float edge=smoothstep(.15,.72,length(uv-.5));
 float uneven=.85+.15*sin(uv.x*21.)*sin(uv.y*17.);
 float reservoir=max(0.,old.g-dt*(.002+.009*edge)*uneven);
 float spread=1.-smoothstep(bloomRadius*.4,bloomRadius,length(uv-vec2(.5,.46)));
 float deposition=breath*(.12+.88*spread)*(1.-.35*edge)*2.4*dt;
 reservoir=1.-(1.-reservoir)*exp(-deposition);
 float fog=mix(old.r,reservoir,1.-exp(-dt/3.2));
 fog=1.-(1.-fog)*exp(-deposition);
 float streak=.93+.07*sin(dot(p,normalize(vec2(-ab.y,ab.x)+vec2(.00001)))*280.);
 float brush=radius*(1.+.06*palm*sin(uv.y*90.+uv.x*25.));
 float wipe=(1.-smoothstep(brush*.65,brush*1.25,d))*drawing*(1.-.08*palm)*mix(1.,streak,palm);
 // Residual water gathers at wet strokes, then advects down the glass.
 vec2 flow=vec2(sin(uv.y*83.+uv.x*41.)*.002, .045+old.b*.045)*dt;
 float water=texture(previous,uv+flow).b*exp(-dt*.55);
 vec2 cell=floor(uv*vec2(90.*aspect,90.));
 float bead=1.-smoothstep(.09,.3,length(fract(uv*vec2(90.*aspect,90.))-.5));
 water=max(water,wipe*old.r*bead*step(.94,hash(cell)));
 fog*=1.-wipe;
 fog*=exp(-water*dt*12.);
 result=vec4(clamp(fog,0.,1.),reservoir,water,1.);
}
