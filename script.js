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


/* V12 - Google Sheets: Lembaga + Berita + Agenda + Galeri */
const SHEET_CONFIG = {
  // Sheet 1: Lembaga — SUDAH AKTIF
  lembaga: {
    url: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQnygfnzyiybeXkEEWDQPO8rgRvq39r2Xw51jysbERh21dvNNA_LXqUVY4TGAnz74rnDDAIl0iqWo7t/pub?gid=0&single=true&output=csv'
  },

  // Sheet 2: Berita & Pengumuman — isi URL CSV nanti
  berita: {
    url: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQnygfnzyiybeXkEEWDQPO8rgRvq39r2Xw51jysbERh21dvNNA_LXqUVY4TGAnz74rnDDAIl0iqWo7t/pub?gid=1642928142&single=true&output=csv'
  },

  // Sheet 3: Agenda Kegiatan — isi URL CSV nanti
  agenda: {
    url: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQnygfnzyiybeXkEEWDQPO8rgRvq39r2Xw51jysbERh21dvNNA_LXqUVY4TGAnz74rnDDAIl0iqWo7t/pub?gid=2035508812&single=true&output=csv'
  },

  // Sheet 4: Galeri — isi URL CSV nanti
  galeri: {
    url: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQnygfnzyiybeXkEEWDQPO8rgRvq39r2Xw51jysbERh21dvNNA_LXqUVY4TGAnz74rnDDAIl0iqWo7t/pub?gid=939701416&single=true&output=csv'
  }
};

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
    if((c==="\n"||c==="\r")&&!quoted){
      if(c==="\r"&&n==="\n")i++;
      row.push(cell.trim());cell="";
      if(row.some(v=>v))rows.push(row);
      row=[];
      continue;
    }
    cell+=c;
  }
  if(cell||row.length){row.push(cell.trim());if(row.some(v=>v))rows.push(row)}
  if(!rows.length)return [];
  const headers=rows[0].map(v=>v.replace(/^\uFEFF/,"").toLowerCase().trim());
  return rows.slice(1).map(r=>{
    const o={};
    headers.forEach((h,i)=>o[h]=(r[i]||"").trim());
    return o;
  }).filter(o=>Object.values(o).some(v=>v));
}

function esc(v){
  return String(v??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));
}
function items(v){
  return String(v||"").split(/\s*(?:;|\||\n)\s*/).filter(Boolean);
}

function fetchSheet(url){
  if(!url) return Promise.resolve([]);
  const separator=url.includes("?")?"&":"?";
  return fetch(url+separator+"_="+Date.now(),{cache:"no-store",credentials:"omit"})
    .then(r=>{if(!r.ok)throw Error("HTTP "+r.status);return r.text()})
    .then(parseCSV);
}

/* ---------- SHEET 1: LEMBAGA ---------- */
function renderInstitutions(data){
  const el=document.getElementById("institutionCards");
  if(!el)return;
  const usable=data.filter(x=>x.lembaga);
  el.innerHTML=(usable.length?usable:fallbackInstitutions).map((x,i)=>`
    <article class="institution-data-card">
      <span class="institution-data-number">${String(i+1).padStart(2,"0")}</span>
      <h3>${esc(x.lembaga)}</h3>
      <p>${esc(x.deskripsi)}</p>
      <button class="institution-more" type="button" data-inst="${i}">Selengkapnya</button>
    </article>`).join("");
  el.querySelectorAll("[data-inst]").forEach(b=>b.addEventListener("click",()=>showInstitution((usable.length?usable:fallbackInstitutions)[+b.dataset.inst])));
}
function showInstitution(x){
  const section=(title,value)=>{
    const a=items(value);
    return `<div class="detail-block"><h3>${title}</h3>${a.length>1?"<ul>"+a.map(v=>"<li>"+esc(v)+"</li>").join("")+"</ul>":"<p>"+esc(value||"-")+"</p>"}</div>`;
  };
  document.getElementById("institutionDetail").innerHTML=
    `<div class="eyebrow">LEMBAGA</div><h2>${esc(x.lembaga)}</h2>
     <p class="detail-desc">${esc(x.deskripsi)}</p>
     ${section("Visi",x.visi)}${section("Misi",x.misi)}${section("Program",x.program)}
     ${x.kontak?`<div class="detail-contact">${esc(x.kontak)}</div>`:""}`;
  const m=document.getElementById("institutionModal");
  m.classList.add("show");m.setAttribute("aria-hidden","false");
}
document.querySelectorAll("[data-close-modal]").forEach(e=>e.addEventListener("click",()=>{
  const m=document.getElementById("institutionModal");
  m.classList.remove("show");m.setAttribute("aria-hidden","true");
}));

/* ---------- SHEET 2: BERITA ---------- */
function renderNews(data){
  const el=document.getElementById("newsGrid");
  if(!el)return;
  if(!data.length){
    el.innerHTML=`<article class="news-empty"><span>BERITA</span><h3>Belum ada berita</h3><p>Bagian ini sudah siap. Nanti cukup isi Sheet 2 Google Sheets.</p></article>`;
    return;
  }
  el.innerHTML=data.slice(0,9).map(x=>`
    <article class="news-card-dynamic">
      ${x.gambar?`<img src="${esc(x.gambar)}" alt="${esc(x.judul||"Berita")}">`:""}
      <div class="news-card-body">
        ${x.kategori?`<span>${esc(x.kategori)}</span>`:"<span>INFORMASI</span>"}
        ${x.tanggal?`<small>${esc(x.tanggal)}</small>`:""}
        <h3>${esc(x.judul||"Tanpa judul")}</h3>
        <p>${esc(x.isi||x.deskripsi||"")}</p>
        ${x.link?`<a href="${esc(x.link)}" target="_blank" rel="noopener">Baca selengkapnya →</a>`:""}
      </div>
    </article>`).join("");
}

/* ---------- SHEET 3: AGENDA ---------- */
function renderAgenda(data){
  const el=document.getElementById("agendaGrid");
  if(!el)return;
  if(!data.length){
    el.innerHTML=`<article class="agenda-empty"><span>AGENDA</span><h3>Belum ada agenda</h3><p>Bagian ini sudah siap. Nanti cukup isi Sheet 3 Google Sheets.</p></article>`;
    return;
  }
  el.innerHTML=data.slice(0,12).map(x=>`
    <article class="agenda-card-dynamic">
      <div class="agenda-date">
        <b>${esc(x.tanggal||"--")}</b>
        ${x.waktu?`<small>${esc(x.waktu)}</small>`:""}
      </div>
      <div>
        <span>${esc(x.kategori||"KEGIATAN")}</span>
        <h3>${esc(x.judul||x.kegiatan||"Agenda Kegiatan")}</h3>
        <p>${esc(x.lokasi||"")}</p>
        ${x.keterangan?`<div>${esc(x.keterangan)}</div>`:""}
      </div>
    </article>`).join("");
}

/* ---------- SHEET 4: GALERI ---------- */
function renderGallery(data){
  const el=document.getElementById("galleryGrid");
  if(!el)return;
  if(!data.length){
    el.innerHTML=`<div class="gallery-empty">Galeri siap digunakan. Nanti cukup isi Sheet 4 dengan URL foto.</div>`;
    return;
  }
  el.innerHTML=data.slice(0,12).map(x=>`
    <figure class="gallery-item-dynamic">
      <img src="${esc(x.gambar||x.url||"")}" alt="${esc(x.judul||"Dokumentasi Yayasan")}" loading="lazy">
      ${x.judul?`<figcaption>${esc(x.judul)}</figcaption>`:""}
    </figure>`).join("");
}

async function loadAllSheets(){
  try{
    const lembaga=await fetchSheet(SHEET_CONFIG.lembaga.url);
    renderInstitutions(lembaga);
  }catch(e){
    console.warn("Sheet 1 tidak dapat dibaca:",e);
    renderInstitutions([]);
  }

  try{
    const berita=await fetchSheet(SHEET_CONFIG.berita.url);
    renderNews(berita);
  }catch(e){
    console.warn("Sheet 2 belum terhubung:",e);
    renderNews([]);
  }

  try{
    const agenda=await fetchSheet(SHEET_CONFIG.agenda.url);
    renderAgenda(agenda);
  }catch(e){
    console.warn("Sheet 3 belum terhubung:",e);
    renderAgenda([]);
  }

  try{
    const galeri=await fetchSheet(SHEET_CONFIG.galeri.url);
    renderGallery(galeri);
  }catch(e){
    console.warn("Sheet 4 belum terhubung:",e);
    renderGallery([]);
  }
}

loadAllSheets();
