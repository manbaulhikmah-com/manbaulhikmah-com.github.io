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
