import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

const $ = id => document.getElementById(id);
const scoreEl=$("score"), coinsEl=$("coins"), startScreen=$("start-screen"), overScreen=$("gameover-screen"), statusEl=$("asset-status"), qualitySelect=$("quality");
const scene=new THREE.Scene();
scene.background=new THREE.Color(0x9abeb0);
scene.fog=new THREE.FogExp2(0x9abeb0,0.0125);
const camera=new THREE.PerspectiveCamera(58,innerWidth/innerHeight,0.1,220);
camera.position.set(0,4.8,9.2);
const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:"high-performance"});
renderer.setSize(innerWidth,innerHeight); renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));
renderer.shadowMap.enabled=true; renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.outputColorSpace=THREE.SRGBColorSpace; renderer.toneMapping=THREE.ACESFilmicToneMapping; renderer.toneMappingExposure=1.12;
$("game").prepend(renderer.domElement);

scene.add(new THREE.HemisphereLight(0xc8e6ff,0x273322,1.7));
const sun=new THREE.DirectionalLight(0xffd49a,3.3); sun.position.set(-9,17,7); sun.castShadow=true; sun.shadow.mapSize.set(1024,1024); sun.shadow.camera.left=-13; sun.shadow.camera.right=13; sun.shadow.camera.top=18; sun.shadow.camera.bottom=-12; sun.shadow.bias=-0.00025; scene.add(sun);
const fill=new THREE.DirectionalLight(0x9bbcff,0.7); fill.position.set(8,6,-10); scene.add(fill);
const world=new THREE.Group(); scene.add(world);
const mat=(color,roughness=.85,metalness=0)=>new THREE.MeshStandardMaterial({color,roughness,metalness});
const mats={
 soil:mat(0x302c22,1), path:mat(0x68604b,.98), pathLight:mat(0x82765b,.95), moss:mat(0x34513a,.98),
 stone:mat(0x777b68,.94), stoneLight:mat(0x9b987e,.92), stoneDark:mat(0x444e3e,.95),
 bark:mat(0x493629,.98), leafDark:mat(0x183f2b,.95), leaf:mat(0x286440,.93), leafLight:mat(0x4b7843,.9),
 gold:new THREE.MeshStandardMaterial({color:0xffcb35,metalness:.85,roughness:.19,emissive:0x563300,emissiveIntensity:.28}),
 obstacle:mat(0x83513a,.9), vine:mat(0x3b693b,.9)
};
const boxGeo=new THREE.BoxGeometry(1,1,1), sphereGeo=new THREE.SphereGeometry(1,14,12), cylGeo=new THREE.CylinderGeometry(.5,.5,1,12), coneGeo=new THREE.ConeGeometry(1,1,9);
function add(parent,geo,material,x,y,z,sx=1,sy=1,sz=1,cast=true){const o=new THREE.Mesh(geo,material);o.position.set(x,y,z);o.scale.set(sx,sy,sz);o.castShadow=cast;o.receiveShadow=true;parent.add(o);return o;}
function noiseTexture(base,flecks,size=256,count=9000){const c=document.createElement("canvas");c.width=c.height=size;const ctx=c.getContext("2d");ctx.fillStyle=base;ctx.fillRect(0,0,size,size);for(let i=0;i<count;i++){ctx.globalAlpha=.05+Math.random()*.18;ctx.fillStyle=flecks[Math.floor(Math.random()*flecks.length)];const s=1+Math.random()*5;ctx.fillRect(Math.random()*size,Math.random()*size,s,s);}ctx.globalAlpha=1;const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());return t;}
const stoneMap=noiseTexture("#777766",["#c2b99b","#343c30","#a19a7f","#555b4b"],256,12000);stoneMap.repeat.set(2,2);
const roadMap=noiseTexture("#655c46",["#b0a17a","#292b21","#8b7958","#494638"],256,14000);roadMap.repeat.set(2,24);
mats.path.map=roadMap;mats.stone.map=stoneMap;mats.moss.map=noiseTexture("#34513a",["#688047","#1a3025","#8a9250"],128,4000);
add(world,boxGeo,mats.soil,0,-.62,-70,90,.6,180,false);
add(world,boxGeo,mats.path,0,-.22,-72,7.1,.35,180,false);
add(world,boxGeo,mats.moss,-3.8,-.2,-72,.9,.48,180,false);add(world,boxGeo,mats.moss,3.8,-.2,-72,.9,.48,180,false);
const roadTiles=[];for(let i=0;i<50;i++)roadTiles.push(add(world,boxGeo,i%3?mats.pathLight:mats.stoneDark,0,-.018,-i*3.5,6.8,.035,.025,false));

const scenery=[];
function makeTree(x,z,scale=1){const g=new THREE.Group();g.position.set(x,0,z);g.scale.setScalar(scale);world.add(g);
 add(g,cylGeo,mats.bark,0,1.75,0,.42,3.5,.42);
 for(let i=0;i<4;i++){const a=i*Math.PI/2,r=add(g,coneGeo,mats.bark,Math.cos(a)*.38,.22,Math.sin(a)*.38,.28,1.05,.28);r.rotation.z=Math.cos(a)*.75;r.rotation.x=Math.sin(a)*.75;}
 for(let i=0;i<7;i++){const a=i*2.399,r=.55+(i%3)*.28;add(g,sphereGeo,i%3?mats.leaf:mats.leafDark,Math.cos(a)*r,2.8+(i%3)*.48,Math.sin(a)*r,.95+Math.random()*.25,.85+Math.random()*.45,.95+Math.random()*.2);}
 for(let i=0;i<3;i++){const f=add(g,coneGeo,mats.leafLight,(Math.random()-.5)*1.4,.35,(Math.random()-.5)*1.4,.45,.8,.45);f.rotation.z=(Math.random()-.5)*.9;}
 for(let i=0;i<2;i++){const v=add(g,cylGeo,mats.vine,(Math.random()-.5)*.5,2,(Math.random()-.5)*.4,.035,2.4,.035);v.rotation.z=(Math.random()-.5)*.25;}
 scenery.push(g);}
for(let i=0;i<36;i++){const z=-i*5-8;makeTree(-5.3-Math.random()*3.5,z,.85+Math.random()*.75);makeTree(5.3+Math.random()*3.5,z-1.9,.85+Math.random()*.75);}

const temple=new THREE.Group();temple.position.set(0,0,-94);world.add(temple);
add(temple,boxGeo,mats.stoneDark,0,2.1,0,12,4.2,3.2);add(temple,boxGeo,mats.stone,0,4.35,0,13.5,.65,4.3);add(temple,boxGeo,mats.stoneLight,0,4.8,-.1,11.4,.25,3.8);
for(let x=-5;x<=5;x+=2.5){add(temple,cylGeo,mats.stone,x,1.95,1.9,.62,3.9,.62);add(temple,cylGeo,mats.stoneLight,x,3.85,1.9,.78,.25,.78);}
for(let i=0;i<18;i++){const b=add(temple,boxGeo,i%2?mats.stone:mats.stoneDark,(Math.random()-.5)*13,.2+Math.random()*.4,2.7+(Math.random()-.5)*3,.6+Math.random(),.35,.5+Math.random());b.rotation.y=Math.random()*.5;}

const player=new THREE.Group();scene.add(player);player.position.set(0,0,2.1);
let characterRoot=new THREE.Group();player.add(characterRoot);let mixer=null;
function fallbackRunner(){const g=new THREE.Group(),tunic=mat(0x7a3324,.75),leather=mat(0x4a3426,.9),skin=mat(0xc68a61,.8);add(g,boxGeo,tunic,0,1.2,0,.62,.82,.35);add(g,sphereGeo,skin,0,1.92,0,.3,.34,.3);add(g,boxGeo,leather,-.18,.48,0,.22,.62,.24);add(g,boxGeo,leather,.18,.48,0,.22,.62,.24);add(g,boxGeo,skin,-.42,1.25,0,.19,.65,.2);add(g,boxGeo,skin,.42,1.25,0,.19,.65,.2);return g;}
characterRoot.add(fallbackRunner());
new GLTFLoader().load("https://threejs.org/examples/models/gltf/Soldier.glb",gltf=>{
 player.remove(characterRoot);characterRoot=new THREE.Group();player.add(characterRoot);
 const model=gltf.scene;model.scale.setScalar(1);model.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;if(o.material)o.material.roughness=Math.max(.48,o.material.roughness??.7);}});
 characterRoot.add(model);mixer=new THREE.AnimationMixer(model);
 const clip=gltf.animations.find(c=>/run/i.test(c.name))||gltf.animations.find(c=>/walk/i.test(c.name))||gltf.animations[0];
 if(clip)mixer.clipAction(clip).play();statusEl.textContent="Animated 3D character loaded";setTimeout(()=>statusEl.style.opacity="0",2500);
},undefined,e=>{console.warn("Character asset unavailable; using fallback.",e);statusEl.textContent="Built-in character active";});

const obstacles=[],coinItems=[],particles=[],laneX=[-2.15,0,2.15];
function spawnObstacle(){const lane=Math.floor(Math.random()*3),isArch=Math.random()<.35,g=new THREE.Group();g.position.set(laneX[lane],0,-62);
 if(isArch){add(g,boxGeo,mats.obstacle,-.5,1,0,.22,2,.42);add(g,boxGeo,mats.obstacle,.5,1,0,.22,2,.42);add(g,boxGeo,mats.stoneLight,0,2,0,1.25,.25,.5);add(g,boxGeo,mats.moss,0,1.83,0,1.15,.06,.53);}
 else{add(g,boxGeo,mats.stoneDark,0,.65,0,1.15,1.3,.95);add(g,boxGeo,mats.stoneLight,0,1.32,0,1.25,.12,1);add(g,boxGeo,mats.moss,.1,1.4,0,.6,.05,.5);}
 world.add(g);obstacles.push({mesh:g,lane,isArch,hit:false});}
function spawnCoinLine(){const lane=Math.floor(Math.random()*3);for(let i=0;i<6;i++){const g=new THREE.Group();g.position.set(laneX[lane],1.15+Math.sin(i*.7)*.08,-50-i*1.5);const torus=add(g,new THREE.TorusGeometry(.28,.09,10,22),mats.gold,0,0,0,1,1,1,false);torus.rotation.y=Math.PI/2;add(g,new THREE.SphereGeometry(.08,8,8),mats.gold,0,0,0,1,1,1,false);world.add(g);coinItems.push({mesh:g,lane,collected:false,phase:Math.random()*6});}}
function burst(pos,color=0xffd45b,n=12){for(let i=0;i<n;i++){const p=new THREE.Mesh(new THREE.SphereGeometry(.035+Math.random()*.04,6,6),new THREE.MeshBasicMaterial({color,transparent:true,opacity:1}));p.position.copy(pos);p.userData.v=new THREE.Vector3((Math.random()-.5)*3,Math.random()*3,(Math.random()-.5)*2);p.userData.life=.5+Math.random()*.45;scene.add(p);particles.push(p);}}
const motes=new THREE.Group();scene.add(motes);for(let i=0;i<100;i++){const m=new THREE.Mesh(new THREE.SphereGeometry(.02+Math.random()*.02,5,5),new THREE.MeshBasicMaterial({color:i%4===0?0xffd887:0xd7e5a7,transparent:true,opacity:.35}));m.position.set((Math.random()-.5)*17,Math.random()*7,-Math.random()*95);m.userData.phase=Math.random()*6;motes.add(m);}

let running=false,gameOver=false,laneIndex=1,score=0,coinCount=0,speed=16,jumpTime=0,slideTime=0,spawnTimer=0,coinTimer=0,elapsed=0;
function reset(){for(const o of obstacles)world.remove(o.mesh);obstacles.length=0;for(const c of coinItems)world.remove(c.mesh);coinItems.length=0;for(const p of particles)scene.remove(p);particles.length=0;score=0;coinCount=0;speed=16;elapsed=0;laneIndex=1;jumpTime=0;slideTime=0;spawnTimer=.45;coinTimer=1.4;player.position.set(0,0,2.1);player.rotation.set(0,0,0);characterRoot.scale.set(1,1,1);scoreEl.textContent="00000";coinsEl.textContent="0";gameOver=false;running=true;startScreen.classList.add("hidden");overScreen.classList.add("hidden");}
function finish(){if(gameOver)return;gameOver=true;running=false;$("final-score").textContent=Math.floor(score);$("final-coins").textContent=coinCount;overScreen.classList.remove("hidden");burst(player.position.clone().add(new THREE.Vector3(0,1,0)),0xff8b54,18);}
function laneMove(d){if(running)laneIndex=THREE.MathUtils.clamp(laneIndex+d,0,2);}
function jump(){if(running&&jumpTime<=0&&slideTime<=0)jumpTime=.82;}
function slide(){if(running&&slideTime<=0&&jumpTime<=0)slideTime=.76;}
$("start-btn").onclick=reset;$("restart-btn").onclick=reset;$("left-btn").onclick=()=>laneMove(-1);$("right-btn").onclick=()=>laneMove(1);$("jump-btn").onclick=jump;$("slide-btn").onclick=slide;
window.addEventListener("keydown",e=>{if(["ArrowLeft","ArrowRight","ArrowUp","ArrowDown"," "].includes(e.key))e.preventDefault();if(e.key==="ArrowLeft"||e.key.toLowerCase()==="a")laneMove(-1);if(e.key==="ArrowRight"||e.key.toLowerCase()==="d")laneMove(1);if(e.key==="ArrowUp"||e.key===" ")jump();if(e.key==="ArrowDown"||e.key.toLowerCase()==="s")slide();if(!running&&e.key==="Enter"&&!gameOver)reset();});
let pointer=null;renderer.domElement.addEventListener("pointerdown",e=>pointer={x:e.clientX,y:e.clientY});renderer.domElement.addEventListener("pointerup",e=>{if(!pointer)return;const dx=e.clientX-pointer.x,dy=e.clientY-pointer.y;if(Math.max(Math.abs(dx),Math.abs(dy))>24){if(Math.abs(dx)>Math.abs(dy))laneMove(dx>0?1:-1);else if(dy<0)jump();else slide();}pointer=null;});
function quality(mode){const mobile=mode==="mobile"||(mode==="auto"&&(innerWidth<700||/Android|iPhone|iPad/i.test(navigator.userAgent)));renderer.setPixelRatio(Math.min(devicePixelRatio,mobile?1.15:1.7));sun.shadow.mapSize.set(mobile?512:1024,mobile?512:1024);scene.fog.density=mobile?.0145:.0125;renderer.setSize(innerWidth,innerHeight);}
qualitySelect.onchange=()=>quality(qualitySelect.value);quality("auto");
const clock=new THREE.Clock();
function animate(){requestAnimationFrame(animate);const dt=Math.min(clock.getDelta(),.04),time=clock.elapsedTime;if(mixer&&running)mixer.update(dt);
 motes.children.forEach(m=>{m.position.x+=Math.sin(time*.6+m.userData.phase)*dt*.12;m.position.y+=Math.cos(time*.8+m.userData.phase)*dt*.08;});
 if(running){elapsed+=dt;speed=Math.min(29,16+elapsed*.22);score+=speed*dt*1.7;scoreEl.textContent=String(Math.floor(score)).padStart(5,"0");spawnTimer-=dt;coinTimer-=dt;if(spawnTimer<=0){spawnObstacle();spawnTimer=Math.max(.85,1.42-elapsed*.0035)+Math.random()*.3;}if(coinTimer<=0){spawnCoinLine();coinTimer=2.4+Math.random()*.9;}
 player.position.x=THREE.MathUtils.damp(player.position.x,laneX[laneIndex],12,dt);player.rotation.z=THREE.MathUtils.damp(player.rotation.z,(laneX[laneIndex]-player.position.x)*.055,7,dt);
 if(jumpTime>0){jumpTime-=dt;const t=1-Math.max(0,jumpTime)/.82;player.position.y=Math.sin(t*Math.PI)*1.65;}else player.position.y=THREE.MathUtils.damp(player.position.y,0,12,dt);
 if(slideTime>0){slideTime-=dt;characterRoot.scale.y=.62;characterRoot.position.y=-.28;}else{characterRoot.scale.y=THREE.MathUtils.damp(characterRoot.scale.y,1,10,dt);characterRoot.position.y=THREE.MathUtils.damp(characterRoot.position.y,0,10,dt);}
 roadTiles.forEach(t=>{t.position.z+=speed*dt;if(t.position.z>8)t.position.z-=175;});scenery.forEach(t=>{t.position.z+=speed*dt*.75;if(t.position.z>14)t.position.z-=180;});
 for(const o of obstacles){o.mesh.position.z+=speed*dt;const near=Math.abs(o.mesh.position.z-player.position.z)<.88,same=Math.abs(o.mesh.position.x-player.position.x)<.92;if(!o.hit&&near&&same){const jumped=!o.isArch&&jumpTime>.16,slid=o.isArch&&slideTime>.16;if(!jumped&&!slid){o.hit=true;finish();}}}
 for(let i=obstacles.length-1;i>=0;i--)if(obstacles[i].mesh.position.z>12){world.remove(obstacles[i].mesh);obstacles.splice(i,1);}
 for(const c of coinItems){c.mesh.position.z+=speed*dt;c.mesh.rotation.y+=dt*1.8;c.mesh.position.y=1.18+Math.sin(time*3+c.phase)*.1;if(!c.collected&&Math.abs(c.mesh.position.z-player.position.z)<1&&Math.abs(c.mesh.position.x-player.position.x)<.88){c.collected=true;burst(c.mesh.position.clone(),0xffd24b,8);world.remove(c.mesh);coinCount++;coinsEl.textContent=String(coinCount);}}
 for(let i=coinItems.length-1;i>=0;i--)if(coinItems[i].collected||coinItems[i].mesh.position.z>12){world.remove(coinItems[i].mesh);coinItems.splice(i,1);}
 camera.position.x=THREE.MathUtils.damp(camera.position.x,player.position.x*.18,2.5,dt);camera.position.y=THREE.MathUtils.damp(camera.position.y,4.8+player.position.y*.22,2,dt);camera.lookAt(player.position.x*.12,1.15+player.position.y*.1,-5.8);sun.position.x=-9+Math.sin(time*.08)*2;
 }else camera.lookAt(0,1.15,-5.8);
 for(let i=particles.length-1;i>=0;i--){const p=particles[i];p.userData.life-=dt;p.position.addScaledVector(p.userData.v,dt);p.userData.v.y-=4*dt;p.material.opacity=Math.max(0,p.userData.life);if(p.userData.life<=0){scene.remove(p);p.geometry.dispose();p.material.dispose();particles.splice(i,1);}}
 renderer.render(scene,camera);}
animate();
window.addEventListener("resize",()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();quality(qualitySelect.value);});
