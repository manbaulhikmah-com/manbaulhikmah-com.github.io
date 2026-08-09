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


/* V13 - Google Sheets: robust Sheet 1-4 reader */
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

function normalizeKey(v){
  return String(v||"")
    .replace(/^\uFEFF/,"")
    .trim()
    .toLowerCase()
    .replace(/[\s_\-]+/g,"");
}

function parseCSV(text){
  const rows=[]; let row=[],cell="",quoted=false;
  for(let i=0;i<text.length;i++){
    const c=text[i],n=text[i+1];
    if(c==='"' && quoted && n==='"'){cell+='"';i++;continue}
    if(c==='"'){quoted=!quoted;continue}
    if(c===','&&!quoted){row.push(cell.trim());cell="";continue}
    if((c==="\n"||c==="\r")&&!quoted){
      if(c==="\r"&&n==="\n")i++;
      row.push(cell.trim());cell="";
      if(row.some(v=>v!==""))rows.push(row);
      row=[];
      continue;
    }
    cell+=c;
  }
  if(cell!==""||row.length){row.push(cell.trim());if(row.some(v=>v!==""))rows.push(row)}
  if(!rows.length)return [];

  const headers=rows[0].map(normalizeKey);
  return rows.slice(1).map(r=>{
    const o={};
    headers.forEach((h,i)=>{ if(h) o[h]=(r[i]??"").trim(); });
    return o;
  }).filter(o=>Object.values(o).some(v=>v!==""));
}

function fetchSheet(url){
  if(!url) return Promise.resolve([]);
  const separator=url.includes("?")?"&":"?";
  const requestUrl=url+separator+"_nocache="+Date.now();
  return fetch(requestUrl,{
    method:"GET",
    cache:"no-store",
    credentials:"omit",
    headers:{"Cache-Control":"no-cache","Pragma":"no-cache"}
  }).then(r=>{
    if(!r.ok) throw Error("HTTP "+r.status);
    return r.text();
  }).then(text=>{
    if(!text || !text.trim()) return [];
    if(/^\s*<!doctype html/i.test(text) || /^\s*<html/i.test(text)){
      throw Error("URL tidak mengembalikan CSV");
    }
    return parseCSV(text);
  });
}

function val(o,...keys){
  for(const key of keys){
    const k=normalizeKey(key);
    if(o[k]!==undefined && o[k]!=="") return o[k];
  }
  return "";
}

function showLoadState(id,text){
  const el=document.getElementById(id);
  if(el) el.innerHTML=`<div class="sheet-status">${text}</div>`;
}

/* ---------- SHEET 1: LEMBAGA ---------- */
function renderInstitutions(data){
  const el=document.getElementById("institutionCards");
  if(!el)return;
  const usable=data.filter(x=>val(x,"lembaga","nama","nama lembaga"));
  el.innerHTML=(usable.length?usable:fallbackInstitutions).map((x,i)=>`
    <article class="institution-data-card">
      <span class="institution-data-number">${String(i+1).padStart(2,"0")}</span>
      <h3>${esc(val(x,"lembaga","nama","nama lembaga"))}</h3>
      <p>${esc(val(x,"deskripsi","description"))}</p>
      <button class="institution-more" type="button" data-inst="${i}">Selengkapnya</button>
    </article>`).join("");
  el.querySelectorAll("[data-inst]").forEach(b=>b.addEventListener("click",()=>{
    showInstitution((usable.length?usable:fallbackInstitutions)[+b.dataset.inst])
  }));
}
function showInstitution(x){
  const section=(title,value)=>{
    const a=items(value);
    return `<div class="detail-block"><h3>${title}</h3>${a.length>1?"<ul>"+a.map(v=>"<li>"+esc(v)+"</li>").join("")+"</ul>":"<p>"+esc(value||"-")+"</p>"}</div>`;
  };
  document.getElementById("institutionDetail").innerHTML=
    `<div class="eyebrow">LEMBAGA</div><h2>${esc(val(x,"lembaga","nama","nama lembaga"))}</h2>
     <p class="detail-desc">${esc(val(x,"deskripsi","description"))}</p>
     ${section("Visi",val(x,"visi"))}${section("Misi",val(x,"misi"))}${section("Program",val(x,"program"))}
     ${val(x,"kontak","contact")?`<div class="detail-contact">${esc(val(x,"kontak","contact"))}</div>`:""}`;
  const m=document.getElementById("institutionModal");
  if(m){m.classList.add("show");m.setAttribute("aria-hidden","false");}
}


/* V14: Google Drive image links can be pasted directly into "gambar" columns. */
function toImageUrl(url){
  const raw = String(url || "").trim();
  if (!raw) return "";

  // https://drive.google.com/file/d/FILE_ID/view?usp=sharing
  let m = raw.match(/drive\.google\.com\/file\/d\/([^/?#]+)/i);
  if (m) return "https://drive.google.com/uc?export=view&id=" + encodeURIComponent(m[1]);

  // https://drive.google.com/open?id=FILE_ID or other Drive URL with ?id=
  m = raw.match(/[?&]id=([^&#]+)/i);
  if (m && /drive\.google\.com/i.test(raw)) {
    return "https://drive.google.com/uc?export=view&id=" + encodeURIComponent(m[1]);
  }

  // Already a direct image URL.
  return raw;
}

/* ---------- SHEET 2: BERITA ---------- */
function renderNews(data){
  const el=document.getElementById("newsGrid");
  if(!el)return;
  if(!data.length){
    el.innerHTML=`<article class="news-empty"><span>BERITA</span><h3>Belum ada berita</h3><p>Sheet Berita sudah terhubung, tetapi belum ada data yang bisa ditampilkan.</p></article>`;
    return;
  }
  el.innerHTML=data.slice(0,12).map(x=>{
    const title=val(x,"judul","judul berita","title")||"Tanpa judul";
    const image=toImageUrl(val(x,"gambar","foto","image","url gambar"));
    const body=val(x,"isi","isi berita","deskripsi","description");
    const link=val(x,"link","url");
    return `<article class="news-card-dynamic">
      ${image?`<img src="${esc(image)}" alt="${esc(title)}" loading="lazy" onerror="this.style.display='none'">`:""}
      <div class="news-card-body">
        <span>${esc(val(x,"kategori","category")||"INFORMASI")}</span>
        ${val(x,"tanggal","date")?`<small>${esc(val(x,"tanggal","date"))}</small>`:""}
        <h3>${esc(title)}</h3>
        <p>${esc(body)}</p>
        ${link?`<a href="${esc(link)}" target="_blank" rel="noopener noreferrer">Baca selengkapnya →</a>`:""}
      </div>
    </article>`;
  }).join("");
}

/* ---------- SHEET 3: AGENDA ---------- */
function renderAgenda(data){
  const el=document.getElementById("agendaGrid");
  if(!el)return;
  if(!data.length){
    el.innerHTML=`<article class="agenda-empty"><span>AGENDA</span><h3>Belum ada agenda</h3><p>Sheet Agenda sudah terhubung, tetapi belum ada data yang bisa ditampilkan.</p></article>`;
    return;
  }
  el.innerHTML=data.slice(0,12).map(x=>`
    <article class="agenda-card-dynamic">
      <div class="agenda-date">
        <b>${esc(val(x,"tanggal","date")||"--")}</b>
        ${val(x,"waktu","time")?`<small>${esc(val(x,"waktu","time"))}</small>`:""}
      </div>
      <div>
        <span>${esc(val(x,"kategori","category")||"KEGIATAN")}</span>
        <h3>${esc(val(x,"judul","kegiatan","nama kegiatan","title")||"Agenda Kegiatan")}</h3>
        <p>${esc(val(x,"lokasi","tempat","location"))}</p>
        ${val(x,"keterangan","deskripsi","description")?`<div>${esc(val(x,"keterangan","deskripsi","description"))}</div>`:""}
      </div>
    </article>`).join("");
}

/* ---------- SHEET 4: GALERI ---------- */
function renderGallery(data){
  const el=document.getElementById("galleryGrid");
  if(!el)return;
  if(!data.length){
    el.innerHTML=`<div class="gallery-empty">Sheet Galeri sudah terhubung, tetapi belum ada foto yang bisa ditampilkan.</div>`;
    return;
  }
  el.innerHTML=data.slice(0,20).map(x=>{
    const image=toImageUrl(val(x,"gambar","foto","image","url","url gambar"));
    const title=val(x,"judul","keterangan","caption","title");
    if(!image) return "";
    return `<figure class="gallery-item-dynamic">
      <img src="${esc(image)}" alt="${esc(title||"Dokumentasi Yayasan")}" loading="lazy" onerror="this.style.display='none'">
      ${title?`<figcaption>${esc(title)}</figcaption>`:""}
    </figure>`;
  }).join("") || `<div class="gallery-empty">Belum ada URL foto yang valid di Sheet Galeri.</div>`;
}

async function loadOneSheet(configKey, renderFn, elementId, label){
  showLoadState(elementId,`Memuat ${label}...`);
  try{
    const data=await fetchSheet(SHEET_CONFIG[configKey].url);
    renderFn(data);
    console.log(`[V13] ${label}:`,data.length,"baris");
  }catch(e){
    console.error(`[V13] ${label} gagal:`,e);
    const el=document.getElementById(elementId);
    if(el) el.innerHTML=`<div class="sheet-status sheet-error">Data ${label} belum dapat dimuat. Periksa publikasi CSV sheet tersebut.</div>`;
  }
}

async function loadAllSheets(){
  await Promise.all([
    loadOneSheet("lembaga",renderInstitutions,"institutionCards","Lembaga"),
    loadOneSheet("berita",renderNews,"newsGrid","Berita"),
    loadOneSheet("agenda",renderAgenda,"agendaGrid","Agenda"),
    loadOneSheet("galeri",renderGallery,"galleryGrid","Galeri")
  ]);
}

document.querySelectorAll("[data-close-modal]").forEach(e=>e.addEventListener("click",()=>{
  const m=document.getElementById("institutionModal");
  if(m){m.classList.remove("show");m.setAttribute("aria-hidden","true");}
}));

loadAllSheets();

