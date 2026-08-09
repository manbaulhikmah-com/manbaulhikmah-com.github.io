const btn=document.querySelector('.menu-btn');
const nav=document.querySelector('.nav');
if(btn)btn.addEventListener('click',()=>nav.classList.toggle('open'));
document.querySelectorAll('.nav a').forEach(a=>a.addEventListener('click',()=>nav.classList.remove('open')));
const year=document.getElementById('year');
if(year) year.textContent=new Date().getFullYear();

const slides=[...document.querySelectorAll('.hero-slide')];
const dots=[...document.querySelectorAll('.hero-dot')];
let current=0;
let timer=null;

function showSlide(index){
  if(!slides.length)return;
  current=(index+slides.length)%slides.length;
  slides.forEach((slide,i)=>slide.classList.toggle('is-active',i===current));
  dots.forEach((dot,i)=>dot.classList.toggle('active',i===current));
}
function restartSlider(){
  clearInterval(timer);
  timer=setInterval(()=>showSlide(current+1),3000);
}
dots.forEach((dot,index)=>{
  dot.addEventListener('click',()=>{
    showSlide(index);
    restartSlider();
  });
});
showSlide(0);
restartSlider();


/* V10 - Google Sheets */
const SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQnygfnzyiybeXkEEWDQPO8rgRvq39r2Xw51jysbERh21dvNNA_LXqUVY4TGAnz74rnDDAIl0iqWo7t/pub?gid=0&single=true&output=csv';
const fallbackInstitutions = [
{lembaga:"Pondok Pesantren Manbaul Hikmah",deskripsi:"Informasi sedang diperbarui.",visi:"-",misi:"-",program:"-",kontak:""},
{lembaga:"SMK Islam Manbaul Hikmah",deskripsi:"Informasi sedang diperbarui.",visi:"-",misi:"-",program:"-",kontak:""},
{lembaga:"SMP Islam Manbaul Hikmah",deskripsi:"Informasi sedang diperbarui.",visi:"-",misi:"-",program:"-",kontak:""},
{lembaga:"RA Manbaul Hikmah",deskripsi:"Informasi sedang diperbarui.",visi:"-",misi:"-",program:"-",kontak:""},
{lembaga:"MDTA Manbaul Hikmah",deskripsi:"Informasi sedang diperbarui.",visi:"-",misi:"-",program:"-",kontak:""}
];
function parseCSV(text){
  const rows=[]; let row=[],cell="",quoted=false;
  for(let i=0;i<text.length;i++){
    const c=text[i],n=text[i+1];
    if(c==='"'&&quoted&&n==='"'){cell+='"';i++;continue}
    if(c==='"'){quoted=!quoted;continue}
    if(c===','&&!quoted){row.push(cell.trim());cell="";continue}
    if((c==="\n"||c==="\r")&&!quoted){if(c==="\r"&&n==="\n")i++;row.push(cell.trim());cell="";if(row.some(v=>v))rows.push(row);row=[];continue}
    cell+=c;
  }
  if(cell||row.length){row.push(cell.trim());if(row.some(v=>v))rows.push(row)}
  if(!rows.length)return [];
  const headers=rows[0].map(v=>v.toLowerCase().trim());
  return rows.slice(1).map(r=>{const o={};headers.forEach((h,i)=>o[h]=r[i]||"");return o}).filter(o=>o.lembaga);
}
function esc(v){return String(v??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
function items(v){return String(v||"").split(/\s*(?:;|\||\n)\s*/).filter(Boolean)}
function renderInstitutions(data){
  const el=document.getElementById("institutionCards"); if(!el)return;
  el.innerHTML=data.map((x,i)=>`<article class="institution-data-card"><span class="institution-data-number">${String(i+1).padStart(2,"0")}</span><h3>${esc(x.lembaga)}</h3><p>${esc(x.deskripsi)}</p><button class="institution-more" data-inst="${i}">Selengkapnya</button></article>`).join("");
  el.querySelectorAll("[data-inst]").forEach(b=>b.addEventListener("click",()=>showInstitution(data[+b.dataset.inst])));
}
function showInstitution(x){
  const section=(title,value)=>{const a=items(value);return `<div class="detail-block"><h3>${title}</h3>${a.length>1?"<ul>"+a.map(v=>"<li>"+esc(v)+"</li>").join("")+"</ul>":"<p>"+esc(value||"-")+"</p>"}</div>`};
  document.getElementById("institutionDetail").innerHTML=`<div class="eyebrow">LEMBAGA</div><h2>${esc(x.lembaga)}</h2><p class="detail-desc">${esc(x.deskripsi)}</p>${section("Visi",x.visi)}${section("Misi",x.misi)}${section("Program",x.program)}${x.kontak?`<div class="detail-contact">${esc(x.kontak)}</div>`:""}`;
  const m=document.getElementById("institutionModal");m.classList.add("show");m.setAttribute("aria-hidden","false");
}
document.querySelectorAll("[data-close-modal]").forEach(e=>e.addEventListener("click",()=>{const m=document.getElementById("institutionModal");m.classList.remove("show");m.setAttribute("aria-hidden","true")}));
async function loadInstitutionData(){
  try{const r=await fetch(SHEET_CSV_URL+"#"+Date.now(),{cache:"no-store"});if(!r.ok)throw Error("sheet");const d=parseCSV(await r.text());renderInstitutions(d.length?d:fallbackInstitutions)}catch(e){console.warn("Google Sheets tidak dapat dibaca:",e);renderInstitutions(fallbackInstitutions)}
}
loadInstitutionData();
