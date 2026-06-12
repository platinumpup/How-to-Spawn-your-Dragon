const DATA_KEY = "how_to_spawn_your_dragon_data_v2";
const seedDragon = [[11,4],[31,48],[19,11],[36,28],[14,48],[20,37],[29,33],[33,28],[47,21],[5,46],[7,39],[9,24],[18,18],[6,25],[41,16],[2,12],[14,36],[15,26],[34,16],[6,47],[36,28],[38,40],[47,3],[24,17],[2,46]];
const seedNo = [[35,19],[44,6],[43,43],[3,40],[5,36],[5,30],[6,30],[9,2],[33,5],[46,25],[34,23]];

function loadData(){
  const raw=localStorage.getItem(DATA_KEY);
  if(raw){try{return JSON.parse(raw)}catch(e){}}
  const old=localStorage.getItem("how_to_spawn_your_dragon_data_v1");
  if(old){try{const d=JSON.parse(old);saveData(d);return d}catch(e){}}
  const data={dragonEvents:seedDragon,noDragonEvents:seedNo};
  saveData(data);
  return data;
}
function saveData(data){localStorage.setItem(DATA_KEY,JSON.stringify(data))}
let data=loadData();
let pendingLogXY=null;

const $=id=>document.getElementById(id);
const mod=(n,m)=>((n%m)+m)%m;
const rel=(x,y)=>[mod(x,50),mod(y,50)];
const dist=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]);
const weight=(d,s=4)=>Math.exp(-((d*d)/(2*s*s)));
const key=p=>`${p[0]},${p[1]}`;

function nearest(point,arr){
  if(!arr.length)return{p:null,d:999};
  let best=arr[0],bd=dist(point,best);
  for(const p of arr){const d=dist(point,p);if(d<bd){best=p;bd=d}}
  return{p:best,d:bd}
}
function counts(arr){
  const c={};
  for(const p of arr)c[key(p)]=(c[key(p)]||0)+1;
  return c
}
function predict(x,y){
  const p=rel(x,y);
  const dc=counts(data.dragonEvents);
  const nc=counts(data.noDragonEvents);
  const nk=key(p);
  const nd=nearest(p,data.dragonEvents);
  const nn=nearest(p,data.noDragonEvents);
  let dh=data.dragonEvents.reduce((s,q)=>s+weight(dist(p,q)),0);
  let nh=data.noDragonEvents.reduce((s,q)=>s+weight(dist(p,q)),0);
  const exactD=dc[nk]||0;
  const exactN=nc[nk]||0;
  dh+=exactD*1.6+0.8;
  nh+=exactN*1.8+0.8;
  const prob=Math.round((dh/(dh+nh))*100);
  let verdict="LOW",cls="low",advice="Low chance based on current data. Save stamina.";
  if(prob>=68&&nd.d<=7){verdict="HIGH";cls="high";advice="Dragon-leaning spot. Hit this before lower zones."}
  else if(prob>=47&&nd.d<=10){verdict="MAYBE";cls="maybe";advice="Possible. Try after stronger HIGH chickens."}
  return{p,prob,verdict,cls,advice,nd,nn,exactD,exactN}
}
function getXY(){
  const x=parseInt($("xInput").value,10);
  const y=parseInt($("yInput").value,10);
  if(Number.isNaN(x)||Number.isNaN(y)){
    alert("Enter whole-number X and Y coordinates.");
    return null;
  }
  return[x,y];
}
function showPrediction(x,y){
  const r=predict(x,y);
  $("verdict").textContent=r.verdict;
  $("advice").textContent=`${r.advice} Relative: x${r.p[0]}, y${r.p[1]}`;
  $("result").className=`result ${r.cls}`;
  $("details").textContent=`relative position: x${r.p[0]}, y${r.p[1]}
dragon-leaning probability: ${r.prob}%
same relative spot: ${r.exactD} dragon / ${r.exactN} no-dragon
nearest dragon event: x${r.nd.p?.[0]}, y${r.nd.p?.[1]} | ${r.nd.d.toFixed(1)} tiles away
nearest no-dragon event: x${r.nn.p?.[0]}, y${r.nn.p?.[1]} | ${r.nn.d.toFixed(1)} tiles away
total dragon events: ${data.dragonEvents.length}
total no-dragon events: ${data.noDragonEvents.length}`;
}
function addObservation(type,x,y){
  const p=rel(x,y);
  if(type==="dragon")data.dragonEvents.push(p);
  else data.noDragonEvents.push(p);
  saveData(data);
  showPrediction(x,y);
}
function openLogModal(){
  const xy=getXY();
  if(!xy)return;
  pendingLogXY=xy;
  $("modalCoord").textContent=`Coordinate: ${xy[0]},${xy[1]}  |  Relative: x${rel(xy[0],xy[1])[0]}, y${rel(xy[0],xy[1])[1]}`;
  $("logModal").classList.remove("hidden");
}
function closeLogModal(){
  pendingLogXY=null;
  $("logModal").classList.add("hidden");
}

$("checkBtn").onclick=()=>{const xy=getXY();if(xy)showPrediction(xy[0],xy[1])};
$("recordBtn").onclick=openLogModal;
$("modalYes").onclick=()=>{if(pendingLogXY)addObservation("dragon",pendingLogXY[0],pendingLogXY[1]);closeLogModal()};
$("modalNo").onclick=()=>{if(pendingLogXY)addObservation("no",pendingLogXY[0],pendingLogXY[1]);closeLogModal()};
$("modalCancel").onclick=closeLogModal;
$("logModal").onclick=e=>{if(e.target.id==="logModal")closeLogModal()};
$("compactBtn").onclick=()=>document.body.classList.toggle("compact");

$("nextBtn").onclick=()=>{
  const sx=parseInt($("sx").value,10),sy=parseInt($("sy").value,10),fx=parseInt($("fx").value,10),fy=parseInt($("fy").value,10);
  if([sx,sy,fx,fy].some(Number.isNaN)){alert("Enter whole-number start and finish coordinates.");return}
  const dx=fx-sx,dy=fy-sy;
  const nx=fx+dx,ny=fy+dy;
  const pr=predict(nx,ny);
  $("trackerResult").textContent=`direction: x${dx>=0?"+":""}${dx}, y${dy>=0?"+":""}${dy}
next landing point: ${nx},${ny}
finish relative: x${mod(fx,50)}, y${mod(fy,50)}
next relative: x${pr.p[0]}, y${pr.p[1]}
next prediction: ${pr.verdict} (${pr.prob}% dragon-leaning)`;
  $("xInput").value=nx;
  $("yInput").value=ny;
  showPrediction(nx,ny);
  switchScreen("screenCheck");
};

function switchScreen(id){
  document.querySelectorAll(".screen").forEach(s=>s.classList.toggle("active",s.id===id));
  document.querySelectorAll(".tab").forEach(t=>t.classList.toggle("active",t.dataset.screen===id));
}
document.querySelectorAll(".tab").forEach(tab=>{
  tab.addEventListener("click",()=>switchScreen(tab.dataset.screen));
});

if("serviceWorker"in navigator){
  window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));
}


/* Splash screen */
window.addEventListener("load", () => {
  const splash = document.getElementById("splash");
  if (!splash) return;
  setTimeout(() => {
    splash.classList.add("done");
    setTimeout(() => splash.remove(), 520);
  }, 2850);
});
