import { archetypes, questions, zodiacSign, scoreAnswers, getZodiacResult } from './engine.js?v=all-copy-astro-1';
const $ = (s) => document.querySelector(s);
const screens = ['home','date','quiz','result'].map(id => $(`#screen-${id}`));
let state = { date:'', answers:Array(questions.length).fill(null), index:0, locked:false, result:null, sign:null };
function showScreen(name){
  for(const screen of screens){const active=screen.id===`screen-${name}`;screen.hidden=!active;screen.classList.toggle('is-active',active);if(active){screen.classList.remove('is-entering');void screen.offsetWidth;screen.classList.add('is-entering');}}
  window.scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
}
function localDateValue(date=new Date()){date=new Date(date.getTime()-date.getTimezoneOffset()*60000);return date.toISOString().slice(0,10);}
function toast(message){const node=$('#toast');node.textContent=message;node.classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>node.classList.remove('show'),2200);}
function start(){state.date='';state.answers=Array(questions.length).fill(null);state.index=0;state.sign=null;$('#birth-date').value='';$('#date-error').textContent='';showScreen('date');}
function enterQuiz(){state.index=0;renderQuestion();showScreen('quiz');}
function renderQuestion(){
  const q=questions[state.index], n=state.index+1;
  $('#q-number').textContent=String(n).padStart(2,'0');$('#q-counter').textContent=`${String(n).padStart(2,'0')} / 12`;$('#big-number').textContent=String(n).padStart(2,'0');
  const progress=$('.progress-track');progress.setAttribute('aria-valuenow',String(state.index+1));$('#progress-fill').style.width=`${(state.index+1)/questions.length*100}%`;
  $('#question-title').textContent=q.text;const answers=$('#answers');answers.replaceChildren();
  q.options.forEach((option,i)=>{const button=document.createElement('button');button.className='answer';button.type='button';button.dataset.index=String(i);button.setAttribute('aria-pressed',String(state.answers[state.index]===i));button.innerHTML=`<span>${escapeHtml(option.label)}</span>`;button.addEventListener('click',()=>choose(i));answers.append(button);});
  $('#quiz-back').disabled=state.index===0;$('#quiz-back').style.opacity=state.index===0?'.35':'1';
  $('#question-title').focus({preventScroll:true});
}
function escapeHtml(text){return text.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function choose(optionIndex){if(state.locked)return;state.locked=true;state.answers[state.index]=optionIndex;$('#answers').querySelectorAll('.answer').forEach((b,i)=>b.setAttribute('aria-pressed',String(i===optionIndex)));setTimeout(()=>{if(state.index<questions.length-1){state.index++;renderQuestion();}else finish();state.locked=false;},130);}
function finish(){const result=scoreAnswers(state.answers);state.result=result.archetype;$('#result-title').textContent=result.archetype.title;$('#result-short').textContent=result.archetype.short;$('#result-roast').textContent=`${result.archetype.roast} ${result.archetype.roastMore}`;$('#result-strengths').textContent=result.archetype.strengths;$('#result-risks').textContent=result.archetype.risks;const list=$('#result-tips');list.replaceChildren(...result.archetype.tips.map(t=>{const li=document.createElement('li');li.textContent=t;return li;}));
  const astro=$('#astro-block');if(state.sign){astro.hidden=false;$('#zodiac-name').textContent=`/ ${state.sign}`;$('#astro-copy').textContent=getZodiacResult(state.sign,result.archetype.id);}else astro.hidden=true;
  paintCard(result.archetype);showScreen('result');
}
function roundRect(ctx,x,y,w,h,r,color){ctx.fillStyle=color;ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fill();}
function paintCard(type){const c=$('#share-card'),ctx=c.getContext('2d');ctx.fillStyle='#f5f1e8';ctx.fillRect(0,0,c.width,c.height);ctx.fillStyle='#171717';ctx.fillRect(0,0,c.width,70);ctx.fillStyle='#d9ff43';ctx.font='800 24px Arial';ctx.fillText('КТО ТУТ, БЛЯДЬ, ГЛАВНЫЙ?',42,45);ctx.fillStyle='#2453ff';ctx.fillRect(930,0,270,70);ctx.fillStyle='#fff';ctx.font='700 18px Arial';ctx.fillText('ТЕСТ № 01',978,43);
 ctx.fillStyle='#ff7049';ctx.beginPath();ctx.arc(1015,300,124,0,Math.PI*2);ctx.fill();ctx.save();ctx.translate(1015,300);ctx.rotate(-.16);ctx.fillStyle='#171717';ctx.font='900 92px Arial';ctx.textAlign='center';ctx.fillText('ВОТ',0,-4);ctx.fillText('ТАК',0,83);ctx.restore();ctx.fillStyle='#2453ff';ctx.font='900 58px Arial';const titleLines=wrap(ctx,type.title,810);titleLines.slice(0,3).forEach((line,i)=>ctx.fillText(line,48,190+i*66));ctx.fillStyle='#171717';ctx.font='700 27px Arial';wrap(ctx,type.short,800).slice(0,3).forEach((line,i)=>ctx.fillText(line,50,440+i*36));ctx.fillStyle='#171717';ctx.fillRect(0,565,1200,65);ctx.fillStyle='#fff';ctx.font='800 18px Arial';ctx.fillText(location.origin+location.pathname,42,606);ctx.fillStyle='#2453ff';ctx.beginPath();ctx.arc(1128,595,28,0,Math.PI*2);ctx.fill();ctx.fillStyle='#fff';ctx.font='900 24px Arial';ctx.fillText('↗',1118,604);}
function wrap(ctx,text,max){const words=text.split(' '),lines=[];let line='';for(const word of words){const next=line?`${line} ${word}`:word;if(ctx.measureText(next).width>max&&line){lines.push(line);line=word;}else line=next;}if(line)lines.push(line);return lines;}
function shareText(){return `У меня результат: «${state.result.title}». ${state.result.short}\nПройди тест: ${location.href}`;}
$('#start-btn').addEventListener('click',start);
$('#date-continue').addEventListener('click',()=>{const value=$('#birth-date').value;const input=$('#birth-date');if(value){const d=new Date(`${value}T12:00:00`);if(Number.isNaN(d.getTime())||d.toISOString().slice(0,10)!==value||value>localDateValue()){ $('#date-error').textContent='Проверь дату: она должна быть настоящей и не из будущего.';input.focus();return;}state.date=value;state.sign=zodiacSign(value);}else{state.date='';state.sign=null;}$('#date-error').textContent='';enterQuiz();});
$('#date-skip').addEventListener('click',()=>{state.date='';state.sign=null;enterQuiz();});$('#date-back').addEventListener('click',()=>showScreen('home'));
$('#quiz-back').addEventListener('click',()=>{if(state.index>0){state.index--;renderQuestion();}else showScreen('date');});
$('#retake-btn').addEventListener('click',()=>showScreen('home'));
$('#copy-btn').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(shareText());$('#share-status').textContent='Текст результата скопирован.';}catch{$('#share-status').textContent=shareText();}});
$('#share-btn').addEventListener('click',async()=>{const text=shareText();try{if(navigator.share)await navigator.share({title:'Кто тут, блядь, главный?',text,url:location.href});else if(navigator.clipboard){await navigator.clipboard.writeText(text);$('#share-status').textContent='Ссылка и результат скопированы — можно отправлять.';}else $('#share-status').textContent=text;}catch(error){if(error.name!=='AbortError')$('#share-status').textContent='Не удалось открыть меню отправки. Скопируй результат кнопкой ниже.';}});
$('#download-btn').addEventListener('click',()=>{const a=document.createElement('a');a.download='kto-tut-glavnyj.png';a.href=$('#share-card').toDataURL('image/png');a.click();});
$('#birth-date').max=localDateValue();
