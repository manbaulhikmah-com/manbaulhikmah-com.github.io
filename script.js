const btn=document.querySelector('.menu-btn');
const nav=document.querySelector('.nav');
if(btn)btn.addEventListener('click',()=>nav.classList.toggle('open'));
document.querySelectorAll('.nav a').forEach(a=>a.addEventListener('click',()=>nav.classList.remove('open')));
const year=document.getElementById('year'); if(year) year.textContent=new Date().getFullYear();

const slides=[...document.querySelectorAll('.hero-slide')];
const dots=[...document.querySelectorAll('.hero-dot')];
let current=0;
let timer;
function showSlide(index){
  current=(index+slides.length)%slides.length;
  slides.forEach((s,i)=>s.classList.toggle('is-active',i===current));
  dots.forEach((d,i)=>d.classList.toggle('active',i===current));
}
function startSlider(){
  clearInterval(timer);
  timer=setInterval(()=>showSlide(current+1),5000);
}
dots.forEach((dot,i)=>{
  dot.addEventListener('click',()=>{showSlide(i);startSlider();});
});
showSlide(0);
startSlider();
