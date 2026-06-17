const DATA_KEY = "how_to_spawn_your_dragon_data_v3";
const SHEET_URL_KEY = "how_to_spawn_your_dragon_sheet_url";
const CLIENT_ID_KEY = "how_to_spawn_your_dragon_client_id";

const seedDragon = [[11,4],[31,48],[19,11],[36,28],[14,48],[20,37],[29,33],[33,28],[47,21],[5,46],[7,39],[9,24],[18,18],[6,25],[41,16],[2,12],[14,36],[15,26],[34,16],[6,47],[36,28],[38,40],[47,3],[24,17],[2,46]];
const seedNo = [[35,19],[44,6],[43,43],[3,40],[5,36],[5,30],[6,30],[9,2],[33,5],[46,25],[34,23]];

function getClientId(){
  let id = localStorage.getItem(CLIENT_ID_KEY);
  if(!id){
    id = "oof-" + Math.random().toString(36).slice(2) + "-" + Date.now().toString(36);
    localStorage.setItem(CLIENT_ID_KEY, id);
  }
  return id;
}
function loadData(){
  const raw=localStorage.getItem(DATA_KEY);
  if(raw){try{return JSON.parse(raw)}catch(e){}}
  const data={localLogs:[],sharedLogs:[]};
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

function eventArrays(){
  const dragon = [...seedDragon];
  const no = [...seedNo];
  for(const log of (data.localLogs||[])){
    const p=[Number(log.rx),Number(log.ry)];
    if(log.result==="YES") dragon.push(p); else no.push(p);
  }
  for(const log of (data.sharedLogs||[])){
    const p=[Number(log.rx),Number(log.ry)];
    if(log.result==="YES") dragon.push(p); else no.push(p);
  }
  return {dragon,no};
}
function nearest(point,arr){
  if(!arr.length)return{p:null,d:999};
  let best=arr[0],bd=dist(point,best);
  for(const p of arr){const d=dist(point,p);if(d<bd){best=p;bd=d}}
  return{p:best,d:bd}
}
function counts(arr){const c={};for(const p of arr)c[key(p)]=(c[key(p)]||0)+1;return c}
function predict(x,y){
  const p=rel(x,y), arrays=eventArrays();
  const dc=counts(arrays.dragon), nc=counts(arrays.no), nk=key(p);
  const nd=nearest(p,arrays.dragon), nn=nearest(p,arrays.no);
  let dh=arrays.dragon.reduce((s,q)=>s+weight(dist(p,q)),0);
  let nh=arrays.no.reduce((s,q)=>s+weight(dist(p,q)),0);
  const exactD=dc[nk]||0, exactN=nc[nk]||0;
  dh+=exactD*1.6+0.8; nh+=exactN*1.8+0.8;
  const prob=Math.round((dh/(dh+nh))*100);
  let verdict="LOW",cls="low",advice="Low chance based on current data. Save stamina.";
  if(prob>=68&&nd.d<=7){verdict="HIGH";cls="high";advice="Dragon-leaning spot. Hit this before lower zones."}
  else if(prob>=47&&nd.d<=10){verdict="MAYBE";cls="maybe";advice="Possible. Try after stronger HIGH chickens."}
  return{p,prob,verdict,cls,advice,nd,nn,exactD,exactN,totalDragon:arrays.dragon.length,totalNo:arrays.no.length};
}
function getXY(){
  const x=parseInt($("xInput").value,10), y=parseInt($("yInput").value,10);
  if(Number.isNaN(x)||Number.isNaN(y)){alert("Enter whole-number X and Y coordinates.");return null}
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
total dragon events: ${r.totalDragon}
total no-dragon events: ${r.totalNo}`;
}
function logId(x,y,result){return `${Date.now()}-${Math.random().toString(36).slice(2,8)}-${x}-${y}-${result}`}
function getSheetUrl(){return (localStorage.getItem(SHEET_URL_KEY)||"").trim()}
function setSheetUrl(url){localStorage.setItem(SHEET_URL_KEY,url.trim())}
function setSyncStatus(msg,cls=""){
  const el=$("syncStatus"); if(!el)return;
  el.textContent=msg; el.className="sync-status"+(cls?" "+cls:"");
}
function updateSyncStats(){
  const shared=data.sharedLogs||[];
  if($("sharedDragonCount")) $("sharedDragonCount").textContent=shared.filter(x=>x.result==="YES").length;
  if($("sharedNoCount")) $("sharedNoCount").textContent=shared.filter(x=>x.result==="NO").length;
}
async function postLogToSheet(entry){
  const url=getSheetUrl(); if(!url) throw new Error("No URL");
  const body=new URLSearchParams();
  for(const [k,v] of Object.entries({action:"log",...entry})) body.set(k,v);
  await fetch(url,{method:"POST",mode:"no-cors",body});
}
async function syncSharedLogs(showSuccess=true){
  const url=getSheetUrl();
  if(!url){setSyncStatus("No shared sheet connected yet. Paste the Web App URL and tap Save URL.","bad");return}
  setSyncStatus("Syncing shared union log...","");
  const readUrl=url+(url.includes("?")?"&":"?")+"action=read&t="+Date.now();
  const res=await fetch(readUrl,{method:"GET",cache:"no-store"});
  const json=await res.json();
  const seen=new Set();
  data.sharedLogs=(json.logs||[]).map(row=>({
    id:String(row.id||""), ts:String(row.ts||""), x:Number(row.x), y:Number(row.y),
    rx:Number(row.rx), ry:Number(row.ry),
    result:String(row.result||"").toUpperCase()==="YES"?"YES":"NO",
    clientId:String(row.clientId||"")
  })).filter(row=>{
    if(!Number.isFinite(row.x)||!Number.isFinite(row.y)||!Number.isFinite(row.rx)||!Number.isFinite(row.ry)) return false;
    const id=row.id||`${row.ts}-${row.x}-${row.y}-${row.result}-${row.clientId}`;
    if(seen.has(id)) return false; seen.add(id); return true;
  });
  saveData(data); updateSyncStats();
  if(showSuccess) setSyncStatus(`Synced ${data.sharedLogs.length} shared union logs.`,"ok");
  const xy=getXY(); if(xy) showPrediction(xy[0],xy[1]);
}
async function addObservation(result,x,y){
  const p=rel(x,y);
  const entry={id:logId(x,y,result),ts:new Date().toISOString(),x,y,rx:p[0],ry:p[1],result,clientId:getClientId()};
  data.localLogs=data.localLogs||[];
  data.localLogs.push(entry);
  saveData(data); showPrediction(x,y); updateSyncStats();
  if(getSheetUrl()){
    setSyncStatus("Saving to shared sheet...","");
    try{await postLogToSheet(entry); setSyncStatus("Saved to shared sheet. Syncing latest union log...","ok"); await syncSharedLogs(false)}
    catch(e){setSyncStatus("Saved locally, but shared sheet update failed. Check the Web App URL or permissions.","bad")}
  }
}
function openLogModal(){
  const xy=getXY(); if(!xy)return;
  pendingLogXY=xy;
  $("modalCoord").textContent=`Coordinate: ${xy[0]},${xy[1]}  |  Relative: x${rel(xy[0],xy[1])[0]}, y${rel(xy[0],xy[1])[1]}`;
  $("logModal").classList.remove("hidden");
}
function closeLogModal(){pendingLogXY=null;$("logModal").classList.add("hidden")}

$("checkBtn").onclick=()=>{const xy=getXY();if(xy)showPrediction(xy[0],xy[1])};
$("recordBtn").onclick=openLogModal;
$("modalYes").onclick=()=>{if(pendingLogXY)addObservation("YES",pendingLogXY[0],pendingLogXY[1]);closeLogModal()};
$("modalNo").onclick=()=>{if(pendingLogXY)addObservation("NO",pendingLogXY[0],pendingLogXY[1]);closeLogModal()};
$("modalCancel").onclick=closeLogModal;
$("logModal").onclick=e=>{if(e.target.id==="logModal")closeLogModal()};
$("compactBtn").onclick=()=>document.body.classList.toggle("compact");

$("nextBtn").onclick=()=>{
  const sx=parseInt($("sx").value,10),sy=parseInt($("sy").value,10),fx=parseInt($("fx").value,10),fy=parseInt($("fy").value,10);
  if([sx,sy,fx,fy].some(Number.isNaN)){alert("Enter whole-number start and finish coordinates.");return}
  const dx=fx-sx,dy=fy-sy,nx=fx+dx,ny=fy+dy,pr=predict(nx,ny);
  $("trackerResult").textContent=`direction: x${dx>=0?"+":""}${dx}, y${dy>=0?"+":""}${dy}
next landing point: ${nx},${ny}
finish relative: x${mod(fx,50)}, y${mod(fy,50)}
next relative: x${pr.p[0]}, y${pr.p[1]}
next prediction: ${pr.verdict} (${pr.prob}% dragon-leaning)`;
  $("xInput").value=nx; $("yInput").value=ny; showPrediction(nx,ny); switchScreen("screenCheck");
};
function switchScreen(id){
  document.querySelectorAll(".screen").forEach(s=>s.classList.toggle("active",s.id===id));
  document.querySelectorAll(".tab").forEach(t=>t.classList.toggle("active",t.dataset.screen===id));
}
document.querySelectorAll(".tab").forEach(tab=>tab.addEventListener("click",()=>switchScreen(tab.dataset.screen)));

if($("sheetUrlInput")) $("sheetUrlInput").value=getSheetUrl();
if($("saveSheetUrlBtn")) $("saveSheetUrlBtn").onclick=async()=>{
  setSheetUrl($("sheetUrlInput").value);
  try{await syncSharedLogs(true)}catch(e){setSyncStatus("URL saved, but test sync failed. Check deployment permissions.","bad")}
};
if($("syncNowBtn")) $("syncNowBtn").onclick=async()=>{
  try{await syncSharedLogs(true)}catch(e){setSyncStatus("Sync failed. Check Web App URL, deployment access, or internet connection.","bad")}
};
updateSyncStats();
if(getSheetUrl()) setTimeout(()=>syncSharedLogs(false).catch(()=>setSyncStatus("Auto-sync failed. Manual sync may still work.","bad")),900);

if("serviceWorker"in navigator){window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}))}

