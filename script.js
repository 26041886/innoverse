const I={
 "shop": "images/shop.jpg",
 "jar": "images/jar.jpg",
 "score": "images/score.jpg",
 "arrow": "images/arrow.jpg",
 "key": "images/key.jpg",
 "coins": "images/coins.jpg"
};
const TYPES=['Small clothing shop','Hair salon','Restaurant','Small technology business','Spaza shop','Small farming business'];
const CAT=['Sales','Stock purchase','Rent','Wages','Transport','Electricity and airtime','Other'];
const PROV=['Eastern Cape','Free State','Gauteng','KwaZulu-Natal','Limpopo','Mpumalanga','North West','Northern Cape','Western Cape'];
const BG={home:'arrow',about:'coins',ask:'key',analytics:'arrow',signup:'shop',login:'key',terms:'score',privacy:'score',admin:'score',dash:'coins',tx:'jar',stock:'shop',budget:'coins',reports:'arrow',qr:'key',plan:'coins'};
const MENU=[['dash','Dashboard'],['tx','Transactions'],['stock','Stock'],['analytics','Analytics'],['budget','Budget'],['reports','Reports'],['qr','QR code'],['ask','Ask'],['plan','Plans']];
const PUB=['home','about','signup','login','terms','privacy','admin'];
const $=s=>document.querySelector(s);
const L=k=>{try{return JSON.parse(localStorage.getItem(k))}catch(e){return null}};
const S=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}};
let db=L('bl_db')||{users:[],cfg:{},fails:{}};
db.cfg=Object.assign({prices:[0,20,50,100],free:30},db.cfg);db.users.forEach(u=>{if(u.role==='user')u.plan=u.plan==='premium'?2:+u.plan||0});
const save=()=>S('bl_db',db);
let cur=null,tm,rm='',lang=L('bl_lang')||'en';
const h=(t,a={},...c)=>{const e=document.createElement(t);for(const k in a){if(k.startsWith('on'))e.addEventListener(k.slice(2),a[k]);else e.setAttribute(k,a[k])}c.flat(9).forEach(x=>e.append(x));return e};
const U=()=>db.users.find(x=>x.id===cur);
const R=n=>(n<0?'-R':'R')+Math.abs(n).toLocaleString('en-ZA',{minimumFractionDigits:2,maximumFractionDigits:2});
const month=()=>new Date().toISOString().slice(0,7);
const sum=(a,t)=>a.filter(x=>x.type===t).reduce((s,x)=>s+x.amt,0);
const stats=(u,m)=>{const t=u.tx.filter(x=>x.d.startsWith(m)),i=sum(t,'in'),e=sum(t,'out'),p=i-e;return{t,i,e,p}};
const hx=async(p,s)=>{const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s+p));return[...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('')};
const say=(f,t)=>{f.querySelector('.m').textContent=t};
const go=v=>{if(location.hash==='#'+v)render();else location.hash=v};
const idle=()=>{clearTimeout(tm);if(cur)tm=setTimeout(()=>{cur=null;go('login')},6e5)};
addEventListener('click',idle);addEventListener('keydown',idle);
const btn=(t,v,alt)=>h('button',{class:alt?'alt':'',onclick:()=>go(v)},t);
const card=(l,v)=>h('div',{class:'g'},h('span',{},l),h('b',{},v));
const F=(l,n,t='text',o,opt,v)=>{const a={name:n,type:t};if(!opt)a.required='';if(t==='number'){a.step='any';a.min='0'}if(v!==undefined)a.value=v;return h('label',{},l,o?h('select',{name:n},o.map(x=>h('option',{value:x},x))):h('input',a))};
const form=(k,fn,b)=>{const f=h('form',{onsubmit:async e=>{e.preventDefault();await fn(Object.fromEntries(new FormData(f)),f)}},k,h('p',{class:'m'}),h('button',{},b));return f};
const tbl=(hd,rows)=>h('div',{class:'sc'},h('table',{},h('thead',{},h('tr',{},hd.map(x=>h('th',{},x)))),h('tbody',{},rows.map(r=>h('tr',{},r.map(c=>h('td',{},c)))))));
const PN=['Free','Starter','Business','Pro'];
const lock=(u,l,w)=>u.plan>=l?0:h('div',{class:'g'},h('h2',{},w+' needs the '+PN[l]+' plan'),h('p',{},'Upgrade to use this page.'),btn('See plans','plan'));
const pn9=t=>String(t).replace(/\D/g,'').slice(-9);
const doSignup=async(d,f)=>{const em=d.email.trim().toLowerCase(),ph=pn9(d.phone);
if(ph.length<9)return say(f,'Enter a valid phone number');
if(em&&db.users.some(u=>u.email===em))return say(f,'This email is already registered');
if(db.users.some(u=>u.phone&&pn9(u.phone)===ph))return say(f,'This phone number is already registered');
if(d.pw.length<6)return say(f,'Password needs at least 6 characters');
if(d.pw!==d.pw2)return say(f,'Passwords do not match');
if(d.reg==='Formal'&&!d.regno.trim())return say(f,'Enter your registration number');
const salt=crypto.randomUUID();
const u={id:crypto.randomUUID(),role:'user',email:em,salt,hash:await hx(d.pw,salt),plan:0,off:0,owner:d.owner.trim(),biz:d.biz.trim(),type:d.type,reg:d.reg,regno:d.regno.trim(),phone:d.phone.trim(),prov:d.prov,yrs:+d.yrs,emp:+d.emp,tx:[],stock:[],bud:{b:0,g:0}};
db.users.push(u);save();cur=u.id;idle();go('dash')};
const doLogin=role=>async(d,f)=>{const em=d.email.trim().toLowerCase(),x=db.fails[em]||{n:0,t:0};
if(x.n>=5&&Date.now()-x.t<3e5)return say(f,'Too many attempts. Try again in 5 minutes');
const u=db.users.find(a=>a.role===role&&((a.email&&a.email===em)||(a.phone&&pn9(em).length>8&&pn9(a.phone)===pn9(em))));
if(!u||await hx(d.pw,u.salt)!==u.hash){db.fails[em]={n:x.n+1,t:Date.now()};save();return say(f,'Wrong email or password')}
if(u.off)return say(f,'This account is suspended');
delete db.fails[em];save();cur=u.id;idle();go(role==='admin'?'admin':'dash')};
const doSetup=async(d,f)=>{if(d.pw.length<10)return say(f,'Password needs 10 or more characters');const salt=crypto.randomUUID();db.users.push({id:crypto.randomUUID(),role:'admin',email:d.email.trim().toLowerCase(),salt,hash:await hx(d.pw,salt)});save();render()};
const loginBox=role=>h('div',{class:'g narrow'},h('h2',{},role==='admin'?'Admin log in':'Log in'),form([F('Email or phone number','email','text'),F('Password','pw','password')],doLogin(role),'Log in'),role==='user'?h('p',{},'No account? ',h('a',{href:'#signup'},'Register your business')):'');
const sv=(t,a={},...c)=>{const e=document.createElementNS('http://www.w3.org/2000/svg',t);for(const k in a)e.setAttribute(k,a[k]);c.flat().forEach(x=>e.append(x));return e};
const NW=['zero','one','two','three','four','five','six','seven','eight','nine','ten','eleven','twelve','thirteen','fourteen','fifteen','sixteen','seventeen','eighteen','nineteen'],TW=['','','twenty','thirty','forty','fifty','sixty','seventy','eighty','ninety'];
const words=n=>n<20?NW[n]:n<100?TW[Math.floor(n/10)]+(n%10?' '+NW[n%10]:''):n<1e3?NW[Math.floor(n/100)]+' hundred'+(n%100?' and '+words(n%100):''):n<1e6?words(Math.floor(n/1e3))+' thousand'+(n%1e3?(n%1e3<100?' and ':' ')+words(n%1e3):''):words(Math.floor(n/1e6))+' million'+(n%1e6?' '+words(n%1e6):'');
const spoken=t=>t.replace(/(-?)R([\d,.\u00a0\u202f ]*\d)/g,(m,ng,q)=>{const i=Math.max(q.lastIndexOf(','),q.lastIndexOf('.')),a=+q.slice(0,i).replace(/[^\d]/g,''),c=+q.slice(i+1);return (ng?'minus ':'')+words(a)+' rand'+(c?' and '+words(c)+' cents':'')});
const pickVoice=()=>{const v=speechSynthesis.getVoices().filter(x=>/^en/i.test(x.lang));return v.find(x=>/natural|neural|online/i.test(x.name))||v.find(x=>/google|samantha|karen|aria|jenny|moira|serena/i.test(x.name))||v.find(x=>/en-ZA/i.test(x.lang))||v[0]};
const speak=(t,done)=>{try{speechSynthesis.cancel();const p=spoken(t).split(/(?<=[.!?])\s+/).filter(Boolean),v=pickVoice();p.forEach((x,i)=>{const m=new SpeechSynthesisUtterance(x);if(v)m.voice=v;m.rate=.93;m.pitch=1.02;if(i===p.length-1)m.onend=m.onerror=()=>done&&done();speechSynthesis.speak(m)})}catch(e){done&&done()}};
const price=i=>'R'+db.cfg.prices[i];
const verdict=s=>s.p>0?['win',`You made a profit of ${R(s.p)} this month.`]:s.p<0?['lose',`You made a loss of ${R(-s.p)} this month. Your expenses are higher than your income.`]:['',s.i?'You broke even this month.':'No records this month yet.'];
const voice=(u,t)=>u.plan>=3?h('button',{class:'alt',onclick:()=>speak(t)},'Listen'):h('p',{class:'m'},'Voice over is on the Pro plan.');
const MN=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const sp=p=>{const n=p.length,dx=[],m=[],t=[];for(let i=0;i<n-1;i++){dx[i]=p[i+1][0]-p[i][0];m[i]=(p[i+1][1]-p[i][1])/dx[i]}
t[0]=m[0];t[n-1]=m[n-2];for(let i=1;i<n-1;i++)t[i]=m[i-1]*m[i]<=0?0:2*m[i-1]*m[i]/(m[i-1]+m[i]);
let d=`M${p[0][0]} ${p[0][1]}`;for(let i=0;i<n-1;i++){const k=dx[i]/3;d+=` C${p[i][0]+k} ${p[i][1]+t[i]*k} ${p[i+1][0]-k} ${p[i+1][1]-t[i+1]*k} ${p[i+1][0]} ${p[i+1][1]}`}return d};
const stat=(l,v)=>h('div',{class:'stat'},h('small',{},l),h('b',{},v));
const plot=(ttl,LB,d,n,hl,bl,pr,fd)=>{const A=d.concat(fd||[]),E=A.map(a=>a.e),P=A.map(a=>a.p);
const mx=Math.max(1,...E,...P),mi=Math.min(0,...P),s0=(mx-mi)/4,pw=10**Math.floor(Math.log10(s0)),st=[1,2,5,10].map(k=>k*pw).find(k=>k>=s0),hi=Math.ceil(mx/st)*st,lo=Math.floor(mi/st)*st;
const L=62,Rt=688,T=26,B=262,W=(Rt-L)/LB.length,x=i=>L+(i+.5)*W,yy=v=>B-(v-lo)/(hi-lo)*(B-T);
const tk=[...Array(Math.round((hi-lo)/st)+1)].map((_,i)=>lo+i*st);
const tx=(a,b,t,o={})=>sv('text',{x:a,y:b,fill:'rgba(255,255,255,.85)','font-size':11,...o},t);
const lab=v=>Math.abs(v)>=1000?+(v/1000).toFixed(1)+'k':+v.toFixed(2);
const ls=[[E.slice(0,n),'#e0b04a','ge'],[P.slice(0,n),'#5fd08b','gp']],fs=fd&&fd.length?[[E,'#e0b04a'],[P,'#5fd08b']]:[],pts=a=>a.map((v,i)=>[x(i),yy(v)]);
const fz=fs.length?[sv('rect',{x:x(n-1)+W/2,y:T,width:Rt-x(n-1)-W/2,height:B-T,fill:'#fff','fill-opacity':.05}),tx(Rt-4,T+12,'Forecast',{'text-anchor':'end','font-style':'italic'}),...fs.flatMap(([a,c])=>[sv('path',{d:sp(pts(a).slice(n-1)),fill:'none',stroke:c,'stroke-width':2,'stroke-dasharray':'6 4'}),...a.slice(n).map((v,i)=>sv('circle',{cx:x(n+i),cy:yy(v),r:3.5,fill:'rgba(6,21,26,.9)',stroke:c,'stroke-width':1.5}))])]:[];
const defs=sv('defs',{},ls.map(([a,c,id])=>sv('linearGradient',{id,x1:0,y1:0,x2:0,y2:1},sv('stop',{offset:0,'stop-color':c,'stop-opacity':.35}),sv('stop',{offset:1,'stop-color':c,'stop-opacity':0}))));
const gd=sv('line',{y1:T,y2:B,stroke:'rgba(255,255,255,.55)','stroke-dasharray':'4 3'}),ce=sv('circle',{r:6,fill:'none',stroke:'#e0b04a','stroke-width':2}),cp=sv('circle',{r:6,fill:'none',stroke:'#5fd08b','stroke-width':2});
const tb=sv('rect',{width:172,height:80,rx:6,fill:'rgba(6,21,26,.94)',stroke:'rgba(255,255,255,.4)'}),tt=[0,1,2,3].map(k=>tx(0,0,'',{'font-size':12,'font-weight':k?400:700}));
const show=i=>{const a=A[i],X=x(i),bx=X>400?X-184:X+12;
gd.setAttribute('x1',X);gd.setAttribute('x2',X);
[[ce,E[i]],[cp,P[i]]].forEach(([c,v])=>{c.setAttribute('cx',X);c.setAttribute('cy',yy(v))});
tb.setAttribute('x',bx);tb.setAttribute('y',T);
[LB[i]+(i>=n?' (forecast)':''),'Income '+R(a.i),'Expenses '+R(a.e),(a.p<0?'Loss ':'Profit ')+R(Math.abs(a.p))].forEach((t,k)=>{tt[k].setAttribute('x',bx+10);tt[k].setAttribute('y',T+18+k*17);tt[k].textContent=t})};
const ov=sv('rect',{x:L,y:T,width:Rt-L,height:B-T,fill:'transparent',style:'touch-action:pan-y'});
const mv=e=>{const r=ov.getBoundingClientRect();show(Math.max(0,Math.min(A.length-1,Math.floor((e.clientX-r.left)/r.width*LB.length))))};
ov.addEventListener('pointermove',mv);ov.addEventListener('pointerdown',mv);ov.addEventListener('pointerleave',()=>show(n-1));
show(n-1);
const I=d.reduce((a,v)=>a+v.i,0),X=d.reduce((a,v)=>a+v.e,0),yp=I-X,bi=P.slice(0,n).indexOf(Math.max(...P.slice(0,n)));
return h('div',{class:'g'},h('h2',{},ttl),h('div',{class:'stats'},stat('Total expenses',R(X)),stat(yp<0?'Total loss':'Total profit',R(Math.abs(yp))),stat('Profit margin',I?Math.round(yp/I*100)+'%':'No income yet'),stat('Best '+bl,I||X?LB[bi]+' '+R(P[bi]):'No records yet')),
h('p',{},h('span',{class:'k1'},'Expenses'),' ',h('span',{class:'k2'},'Profit'),' ',h('span',{class:'k3'},'Loss'),' ',h('small',{},'Hover or tap a month for the figures.')),
h('div',{class:'sc'},sv('svg',{viewBox:'0 0 700 296',style:`min-width:${Math.max(560,LB.length*34)}px;width:100%`},defs,
hl?sv('rect',{x:x(n-1)-W/2,y:T,width:W,height:B-T,fill:'#fff','fill-opacity':.07}):'',
tk.map(v=>sv('line',{x1:L,x2:Rt,y1:yy(v),y2:yy(v),stroke:v===0?'rgba(255,255,255,.75)':'rgba(255,255,255,.2)','stroke-dasharray':v===0?'':'3 4'})),
tk.map(v=>tx(L-8,yy(v)+4,'R'+lab(v),{'text-anchor':'end'})),
tx(L-8,T-10,'Rand',{'text-anchor':'end','font-style':'italic'}),
LB.map((m,i)=>tx(x(i),B+20,m,{'text-anchor':'middle',opacity:i<A.length?1:.4})),
n>1?ls.map(([a,c,id])=>sv('path',{d:sp(pts(a))+` L${x(n-1)} ${yy(0)} L${x(0)} ${yy(0)} Z`,fill:`url(#${id})`})):'',
n>1?ls.map(([a,c])=>sv('path',{d:sp(pts(a)),fill:'none',stroke:c,'stroke-width':2.5,'stroke-linecap':'round'})):'',
ls.flatMap(([a,c])=>a.map((v,i)=>sv('circle',{cx:x(i),cy:yy(v),r:3.5,fill:c==='#5fd08b'&&v<0?'#ff7a6b':c,stroke:'rgba(6,21,26,.9)','stroke-width':1.5}))),
fz,gd,ce,cp,tb,tt,ov)),
h('p',{class:'v '+(yp>0?'win':yp<0?'lose':'')},yp>0?`${pr} you are in profit by ${R(yp)}.`:yp<0?`${pr} you are at a loss of ${R(-yp)}.`:'No profit or loss recorded yet.'))};
const chart=(u,y)=>{const n=y===month().slice(0,4)?+month().slice(5,7):12;return plot('Expenses and profit in '+y,MN,[...Array(n)].map((_,i)=>stats(u,`${y}-${String(i+1).padStart(2,'0')}`)),n,y===month().slice(0,4),'month','This year so far')};
const AB=()=>[['What is Inno-Verse','A digital platform where small businesses record daily sales, expenses and stock. At month end it calculates your profit or loss, and at year end it generates your annual financial statements for you.'],['Who it is for',TYPES.join(', ')+'. Formal and informal businesses are welcome.'],['What you get','Daily records, stock taking with the profit you will make, budget and cost analysis, a graph of expenses and profit, annual statements, a payment QR code and voice over.'],['Plans',PN.map((n,i)=>n+' '+price(i)).join(', ')+' per month.'],['Not a bank','Inno-Verse is a bookkeeping platform. It does not hold your money.']];
const today=()=>new Date().toLocaleDateString('sv');
const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
let chat=[];
const LX={today:/today|vandag|namhlanje|lehono|namusi|namuntlha/,yest:/yesterday|gister|izolo|maabane|mulovha|\btolo\b/,week:/week|isonto|beke/,month:/month|maand|inyanga|kgwedi/,year:/year|annual|jaar|unyaka|ngwaga/,last:/last|previous|past|laaste|verlede|odlule|go feta/,
profit:/profit|loss|\bmade\b|\bmake\b|making|doing well|how am i doing|how is (my )?business|\bwins\b|verlies|inzuzo|ilahleko|poelo|tahlegelo|\bnet\b/,
income:/income|sales|\bsold\b|\bsell\b|revenue|earn|takings|turnover|inkomste|verkope|verkoop|imali engenayo|ukuthengisa|dithekišo|letseno/,
exp:/expens|spend|spent|cost|bills|outgoing|uitgawe|koste|izindleko|ditshenyegelo/,most:/most|highest|biggest|\btop\b|worst|meeste|duurste|kakhulu|kgolo/,
goal:/goal|target|doel|inhloso|nepo/,budget:/budget|begroting|isabelomali|tekanyetšo/,stock:/stock|inventory|voorraad|isitoko|setoko/,
low:/\blow\b|running out|run out|reorder|restock|almost finished/,best:/best.?sell|popular|sells the most|most sold|top seller/,fore:/forecast|predict|projection|next (week|month)|will i|voorspel|verwag/,
avg:/average|per day|gemiddeld/,cmp:/compare|versus|\bvs\b|better than|worse than|than last|growth/,margin:/margin/,
tips:/\btips?\b|advice|improve|increase profit|make more|save money|advise|suggest|grow my/,plan:/\bplan\b|upgrade|subscri|starter|pro plan/,
how:/how (do|can|to|should)|where (do|can)|show me how/,hi:/^(hi|hello|hey|howzit|sawubona|dumela|hallo|molo)\b|good (morning|afternoon|evening)/,
thanks:/thank|siyabonga|dankie|ke a leboga|cheers/,what:/who are you|what are you|what can you|can you do|^help\b|what is inno/};
const CATQ=[[/rent/,'Rent'],[/wage|salar|staff/,'Wages'],[/transport|fuel|taxi|petrol/,'Transport'],[/electric|airtime|data bundle|power/,'Electricity and airtime']];
const HOW=[[/delete|remove/,'To remove a stock item, press Delete twice next to it on the Stock page. To remove a transaction, press Delete in the Transactions list.'],[/sell|sale/,'Open Stock, find the item and press Sell. The amount is worked out and the stock goes down.'],[/photo|picture/,'On the Stock page, press Add photo under an item name.'],[/stock|item/,'Open Stock and use Add stock item. You can add a photo too.'],[/statement|annual/,'Open Reports. Annual statements need the Business plan or above.'],[/qr|pay/,'Open QR code. It needs the Business plan or above.'],[/language|afrikaans|zulu|sepedi/,'Use the language box at the top of the page.'],[/plan|upgrade/,'Open Plans and choose a plan.'],[/log ?in|phone|password/,'You can log in with your email or phone number and your password.'],[/forecast|analytic/,'Open Analytics and choose Daily, Weekly or Yearly. The dashed lines are the forecast.'],[/record|add|transaction|expense/,'Open Transactions, fill in the form, choose the date and press Save.']];
const VOC='profit expenses expense income sales stock forecast yesterday budget average margin compare goal today month week year inventory revenue spent spend predict running selling transactions'.split(' ');
const lev=(a,b)=>{const d=[...Array(b.length+1).keys()];for(let i=1;i<=a.length;i++){let p=d[0];d[0]=i;for(let j=1;j<=b.length;j++){const t=d[j];d[j]=Math.min(d[j]+1,d[j-1]+1,p+(a[i-1]===b[j-1]?0:1));p=t}}return d[b.length]};
const fix=(q,u)=>q.split(/\s+/).map(w=>w.length>4&&!VOC.includes(w)&&!u.stock.some(i=>i.name.toLowerCase().includes(w))?(VOC.find(v=>Math.abs(v.length-w.length)<2&&lev(w,v)<=1)||w):w).join(' ');
let lastI='';
const sh2=(d,n)=>{const t=new Date(d+'T00:00');t.setDate(t.getDate()+n);return dk(t)};
const span=q=>{const n=new Date(),at=o=>{const t=new Date(n);t.setDate(t.getDate()+o);return dk(t)},mon=-((n.getDay()+6)%7),ml=LX.last.test(q);
const nd=q.match(/(?:last|past) (\d+) days?/);if(nd){const k=Math.min(365,+nd[1]);return[at(1-k),at(0),`in the last ${k} days`]}
if(/all time|\bever\b|since i started|in total/.test(q))return['0000-01-01','9999-12-31','overall'];
if(LX.yest.test(q))return[at(-1),at(-1),'yesterday'];if(LX.today.test(q))return[at(0),at(0),'today'];
if(LX.week.test(q))return ml?[at(mon-7),at(mon-1),'last week']:[at(mon),at(0),'this week'];
if(LX.year.test(q)){const y=n.getFullYear()-(ml?1:0);return[y+'-01-01',y+'-12-31',ml?'last year':'this year']}
const lm=ml&&LX.month.test(q),m=new Date(n.getFullYear(),n.getMonth()-(lm?1:0),1);return[dk(m),dk(new Date(m.getFullYear(),m.getMonth()+1,0)),lm?'last month':'this month']};
const answer=(u,q)=>{q=fix(q.toLowerCase().trim(),u);const T=r=>LX[r].test(q),[a,b,w]=span(q),s=rng(u,a,b),c={};
s.t.filter(x=>x.type==='out').forEach(x=>c[x.cat]=(c[x.cat]||0)+x.amt);
const top=Object.entries(c).sort((x,y)=>y[1]-x[1])[0],g=u.bud.g,bd=u.bud.b,it=u.stock.find(i=>q.includes(i.name.toLowerCase())),cat=CATQ.find(([r])=>r.test(q)),sd={};
s.t.filter(x=>x.type==='in'&&x.item).forEach(x=>{const o=sd[x.item]||(sd[x.item]={q:0,a:0});o.q+=x.q;o.a+=x.amt});
const none=!s.i&&!s.e,lowL=u.stock.filter(i=>i.qty<=5),pv2=s.p>0?`You made a profit of ${R(s.p)}`:s.p<0?`You made a loss of ${R(-s.p)}`:'You broke even';
const RU=[
['thx',()=>T('thanks'),()=>'You are welcome. Ask me anything else about your business.'],
['hi',()=>T('hi'),()=>'Hi. Ask me about your profit, expenses, stock, goal or forecast.'],
['tips',()=>T('tips'),()=>{const n=new Date(),m=rng(u,dk(new Date(n.getFullYear(),n.getMonth(),1)),dk(n)),mc={};m.t.filter(x=>x.type==='out').forEach(x=>mc[x.cat]=(mc[x.cat]||0)+x.amt);const mt=Object.entries(mc).sort((x,y)=>y[1]-x[1])[0],t=[];
if(!m.i&&!m.e)return'Start by recording your daily sales and expenses. Then I can give advice from your numbers.';
if(m.p<0)t.push('You are making a loss this month, so cut costs or raise prices first.');
if(mt&&m.e&&mt[1]/m.e>.4)t.push(`${mt[0]} is ${Math.round(mt[1]/m.e*100)}% of your expenses. Look for a cheaper option there.`);
if(m.i&&m.p>=0&&m.p/m.i<.2)t.push(`Your profit margin is ${Math.round(m.p/m.i*100)}%. Try raising prices a little or buying stock cheaper.`);
const lm=u.stock.filter(i=>i.price>0&&(i.price-i.cost)/i.price<.15);if(lm.length)t.push(`${lm.map(i=>i.name).join(', ')} earn very little on each sale. Check their prices.`);
if(lowL.length)t.push(`Restock ${lowL.map(i=>i.name).join(', ')} so you do not miss sales.`);
if(!g)t.push('Set a monthly profit goal on the Budget page so you can track it.');
return t.length?t.slice(0,3).join(' '):'You are doing well. Keep recording every day and watch your costs.'}],
['what',()=>T('what'),()=>'I answer questions about your records: profit, income, expenses, what costs most, stock levels, best sellers, goals, budget, forecasts and tips. I understand some Afrikaans, isiZulu and Sepedi words, but I reply in English.'],
['how',()=>T('how'),()=>(HOW.find(([r])=>r.test(q))||[0,null])[1]],
['busy',()=>/busiest|best day|slowest day|(which|what) day.*(most|best|busy|sell)/.test(q),()=>{const dw={},all=u.tx.filter(x=>x.type==='in');if(!all.length)return'There are no sales recorded yet.';all.forEach(x=>{const k=new Date(x.d+'T00:00').getDay();dw[k]=(dw[k]||0)+x.amt});const D=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],e=Object.entries(dw).sort((x,y)=>y[1]-x[1]);return`${D[e[0][0]]} is your best day for sales, with ${R(e[0][1])} in total.`+(e.length>1?` ${D[e[e.length-1][0]]} is your slowest.`:'')}],
['time',()=>/what time|time is it|today'?s date|what.*\bdate\b|what day is/.test(q),()=>'It is '+new Date().toLocaleString('en-ZA',{dateStyle:'full',timeStyle:'short'})+'.'],
['worst',()=>/worst.?sell|slow.?mov|least sold|not selling|slowest (item|seller)/.test(q)&&u.stock.length>0,()=>{const e=u.stock.map(i=>[i.name,(sd[i.name]||{q:0}).q]).sort((x,y)=>x[1]-y[1])[0];return`${e[0]} sells the slowest ${w}: ${e[1]} sold.`}],
['byprofit',()=>/most profitable|profit per item|item.*(most|more) profit|which item.*profit/.test(q)&&u.stock.length>0,()=>{const e=Object.entries(sd).map(([n,o])=>{const i=u.stock.find(x=>x.name===n);return[n,i?o.q*(i.price-i.cost):o.a]}).sort((x,y)=>y[1]-x[1])[0];return e?`${e[0]} made you the most profit ${w}: about ${R(e[1])}.`:`No stock sales recorded ${w}.`}],
['count',()=>/how many (sales|transactions)|number of (sales|transactions)/.test(q),()=>`You recorded ${s.t.filter(x=>x.type==='in').length} sales and ${s.t.filter(x=>x.type==='out').length} expenses ${w}.`],
['item',()=>!!it,()=>{const k=sd[it.name];if(T('income'))return`You sold ${k?k.q:0} ${it.name} ${w}`+(k?`, worth ${R(k.a)}.`:'.');
if(/price|cost|margin|profit|earn/.test(q))return`${it.name} costs you ${R(it.cost)} and sells for ${R(it.price)}, so you make ${R(it.price-it.cost)} on each.`;
return`You have ${it.qty} ${it.name} in stock. It sells for ${R(it.price)} and costs ${R(it.cost)}.`+(it.qty<=5?' It is running low.':'')}],
['cat',()=>!!cat&&!T('profit'),()=>`You spent ${R(c[cat[1]]||0)} on ${cat[1]} ${w}.`],
['fore',()=>T('fore'),()=>{const wk=/week/.test(q),ser=[],n=new Date(),mon=-((n.getDay()+6)%7);
for(let j=6;j>=1;j--){if(wk){const st=new Date(n);st.setDate(n.getDate()+mon-7*j);const en=new Date(st);en.setDate(st.getDate()+6);ser.push(rng(u,dk(st),dk(en)))}else{const m=new Date(n.getFullYear(),n.getMonth()-j,1);ser.push(rng(u,dk(m),dk(new Date(m.getFullYear(),m.getMonth()+1,0))))}}
const act=ser.filter(x=>x.i||x.e),un=wk?'week':'month';if(act.length<2)return`I need at least two ${un}s of records to make a forecast.`;
const p=fcast(act.map(x=>x.p),1)[0],e=Math.max(0,fcast(act.map(x=>x.e),1)[0]);
return`Based on your last ${act.length} ${un}s, I expect ${p>=0?'a profit':'a loss'} of about ${R(Math.abs(p))} next ${un}, with expenses near ${R(e)}. This is only an estimate from your trend.`}],
['low',()=>T('low'),()=>!u.stock.length?'You have not added any stock yet.':lowL.length?`Running low: ${lowL.map(i=>`${i.name} (${i.qty})`).join(', ')}. Consider restocking.`:'Nothing is running low. Every item has more than 5 in stock.'],
['best',()=>T('best')||(T('most')&&T('income')&&u.stock.length>0),()=>{const e=Object.entries(sd).sort((x,y)=>y[1].q-x[1].q)[0];return e?`${e[0]} is your best seller ${w}: ${e[1].q} sold, worth ${R(e[1].a)}.`:`No stock sales recorded ${w}.`}],
['sold',()=>T('income')&&/what|which|items|products/.test(q)&&!T('profit'),()=>Object.keys(sd).length?`Sold ${w}: ${Object.entries(sd).map(([n,o])=>`${o.q} ${n}`).join(', ')}, worth ${R(Object.values(sd).reduce((x,o)=>x+o.a,0))}.`:`No stock sales recorded ${w}.`],
['most',()=>T('exp')&&T('most'),()=>top?`${top[0]} costs you the most ${w}: ${R(top[1])}, which is ${Math.round(top[1]/s.e*100)}% of your expenses.`+(g&&s.p<g?` That is why you are ${R(g-s.p)} short of your profit goal.`:''):`You have no expenses recorded ${w}.`],
['goal',()=>T('goal'),()=>!g?'You have not set a profit goal yet. You can set one on the Budget page.':s.p>=g?`You have reached your goal of ${R(g)}.`:`You are ${R(g-s.p)} short of your ${R(g)} goal`+(top?`, and ${top[0]} is costing you the most.`:'.')],
['budget',()=>T('budget'),()=>!bd?'You have not set an expense budget yet.':s.e>bd?`You are ${R(s.e-bd)} over your budget of ${R(bd)}.`:`You have ${R(bd-s.e)} left in your budget.`],
['margin',()=>T('margin'),()=>s.i?`Your profit margin ${w} is ${Math.round(s.p/s.i*100)}%.`:`No income recorded ${w}.`],
['avg',()=>T('avg'),()=>{const e=Math.min(new Date(b+'T00:00'),new Date()),d=Math.max(1,Math.round((e-new Date(a+'T00:00'))/864e5)+1);return`Your average sales ${w} are ${R(s.i/d)} a day, and average expenses are ${R(s.e/d)} a day.`}],
['cmp',()=>T('cmp'),()=>{const A=new Date(a+'T00:00'),len=Math.round((new Date(b+'T00:00')-A)/864e5)+1,mo2=w.includes('month'),pa=mo2?dk(new Date(A.getFullYear(),A.getMonth()-1,1)):sh2(a,-len),pb=mo2?dk(new Date(A.getFullYear(),A.getMonth(),0)):sh2(a,-1),p=rng(u,pa,pb),d=s.p-p.p;
return`Your profit ${w} is ${R(s.p)} compared with ${R(p.p)} before. `+(d>0?`That is ${R(d)} better.`:d<0?`That is ${R(-d)} worse.`:'No change.')+` Sales are ${R(s.i)} against ${R(p.i)}.`}],
['stockv',()=>T('stock'),()=>{if(u.plan<1)return'Stock taking is on the Starter plan and above.';if(!u.stock.length)return'You have not added any stock yet.';
const v=u.stock.reduce((x,i)=>x+i.qty*i.cost,0),p=u.stock.reduce((x,i)=>x+i.qty*(i.price-i.cost),0);return`Your stock is worth ${R(v)} at cost. If you sell all of it at your prices you will make ${R(p)}.`+(lowL.length?` Running low on ${lowL.map(i=>i.name).join(', ')}.`:'')}],
['exp',()=>T('exp'),()=>none?`There are no records for ${w} yet.`:`You spent ${R(s.e)} ${w}.`],
['inc',()=>T('income'),()=>none?`There are no records for ${w} yet.`:`Your income ${w} is ${R(s.i)}.`],
['profit',()=>T('profit'),()=>none?`There are no records for ${w} yet.`:`${pv2} ${w}. Income was ${R(s.i)} and expenses were ${R(s.e)}.`],
['plan',()=>T('plan'),()=>`You are on the ${PN[u.plan]} plan at ${price(u.plan)} a month. You can switch on the Plans page.`]];
let hit=RU.find(r=>r[1]());
if(!hit&&lastI&&q.split(/\s+/).length<6&&/today|yesterday|week|month|year|vandag|gister|namhlanje|izolo|lehono|maabane/.test(q))hit=RU.find(r=>r[0]===lastI);
if(hit){lastI=hit[0];return hit[2]()}
return null};
const LANGS=[['en','English'],['af','Afrikaans'],['zu','isiZulu'],['nso','Sepedi'],['ve','Tshivenda (draft)'],['ts','Xitsonga (draft)']];
const TB=[['Menu','Kieslys','Imenyu','Menyu'],['Close','Maak toe','Vala','Tswalela'],['Home','Tuis','Ikhaya','Gae'],['About','Oor ons','Mayelana nathi','Ka ga rena'],['Sign in','Teken in','Ngena','Tsena'],['Log in','Teken in','Ngena','Tsena'],['Sign up','Registreer','Bhalisa','Ngwadiša'],['Log out','Teken uit','Phuma','Tšwa'],['Dashboard','Paneelbord','Ideshibhodi'],['Transactions','Transaksies','Ukuthenga nokuthengisa'],['Stock','Voorraad','Isitoko','Setoko'],['Analytics','Ontleding','Ukuhlaziya','Tshekatsheko'],['Budget','Begroting','Isabelomali','Tekanyetšo'],['Reports','Verslae','Imibiko','Direpoto'],['QR code','QR-kode','Ikhodi ye-QR'],['Ask','Vra','Buza','Botšiša'],['Plans','Planne','Izinhlelo','Dithulaganyo'],
['For small and informal businesses','Vir klein en informele besighede','Emabhizinisini amancane nangahlelekile','Dikgwebong tše nnyane le tše di sa ngwadišwago'],['Daily records, monthly profit and annual statements for your business.','Daaglikse rekords, maandelikse wins en jaarlikse state vir jou besigheid.','Amarekhodi osuku ngosuku, inzuzo yanyanga zonke nezitatimende zonyaka zebhizinisi lakho.','Direkhoto tša ka letšatši, poelo ya ka kgwedi le ditatamente tša ngwaga tša kgwebo ya gago.'],['Know if you made a profit, every month.','Weet of jy elke maand wins gemaak het.','Azi ukuthi uzuze yini, njalo ngenyanga.','Tseba ge o hweditše poelo, kgwedi le kgwedi.'],
['Email or phone number','E-pos of foonnommer','I-imeyili noma inombolo yocingo','Imeile goba nomoro ya mogala'],['Password','Wagwoord','Iphasiwedi','Phasewete'],['Create account','Skep rekening','Dala i-akhawunti','Hlama akhaonto'],['Register your business','Registreer jou besigheid','Bhalisa ibhizinisi lakho','Ngwadiša kgwebo ya gago'],['Owner full name','Eienaar se volle naam','Igama eliphelele lomnikazi','Leina le feletšego la mong'],['Business name','Besigheidsnaam','Igama lebhizinisi','Leina la kgwebo'],['Business type','Tipe besigheid','Uhlobo lwebhizinisi','Mohuta wa kgwebo'],['Province','Provinsie','Isifundazwe','Profense'],['Phone number (you can log in with it)','Foonnommer (jy kan daarmee aanteken)','Inombolo yocingo (ungangena ngayo)','Nomoro ya mogala (o ka tsena ka yona)'],['Email (optional)','E-pos (opsioneel)','I-imeyili (ikhethwa)','Imeile (ga e gapeletšwe)'],
['Income this month','Inkomste hierdie maand','Imali engenile kule nyanga','Letseno la kgwedi ye'],['Expenses this month','Uitgawes hierdie maand','Izindleko zalenyanga','Ditshenyegelo tša kgwedi ye'],['Profit this month','Wins hierdie maand','Inzuzo yalenyanga','Poelo ya kgwedi ye'],['Loss this month','Verlies hierdie maand','Ilahleko yalenyanga','Tahlegelo ya kgwedi ye'],['Recent transactions','Onlangse transaksies','Okwenziwe muva nje'],['Plan','Plan','Uhlelo','Thulaganyo'],
['Record a transaction','Teken ’n transaksie aan','Rekhoda ukuthenga noma ukuthengisa'],['Sales income','Verkoopinkomste','Imali yokuthengisa','Letseno la dithekišo'],['Expense','Uitgawe','Isindleko','Tshenyegelo'],['Latest transactions','Jongste transaksies','Okwakamuva'],['Date','Datum','Usuku','Letšatši'],['Amount (R)','Bedrag (R)','Inani (R)','Tšhelete (R)'],['Category','Kategorie','Isigaba','Sehlopha'],['Description','Beskrywing','Incazelo','Tlhaloso'],['Type','Tipe','Uhlobo','Mohuta'],['Save','Stoor','Gcina','Boloka'],['Delete','Vee uit','Susa','Phumola'],['Update','Opdateer','Buyekeza','Mpshafatša'],['Sell','Verkoop','Thengisa','Rekiša'],
['Daily','Daagliks','Ngosuku','Ka letšatši'],['Weekly','Weekliks','Ngesonto','Ka beke'],['Yearly','Jaarliks','Ngonyaka','Ka ngwaga'],['Sales','Verkope','Ukuthengisa','Dithekišo'],['Expenses','Uitgawes','Izindleko','Ditshenyegelo'],['Profit','Wins','Inzuzo','Poelo'],['Loss','Verlies','Ilahleko','Tahlegelo'],['Number of sales','Aantal verkope','Inani lokuthengisa','Palo ya dithekišo'],
['Add stock item','Voeg voorraaditem by','Engeza into esitokweni','Oketša selo setokong'],['Stock and sales','Voorraad en verkope','Isitoko nokuthengisa','Setoko le dithekišo'],['In stock','In voorraad','Esitokweni','Setokong'],['Sold today','Vandag verkoop','Kuthengiswe namhlanje','Di rekišitšwe lehono'],['Item name','Itemnaam','Igama lento','Leina la selo'],['Quantity','Hoeveelheid','Inani','Palo'],['Cost price (R)','Kosprys (R)','Intengo yokuthenga (R)','Theko ya go reka (R)'],['Selling price (R)','Verkoopprys (R)','Intengo yokuthengisa (R)','Theko ya go rekiša (R)'],['Add item','Voeg by','Engeza','Oketša'],['Photo (optional)','Foto (opsioneel)','Isithombe (ikhethwa)','Seswantšho (ga se gapeletšwe)'],['Add photo','Voeg foto by','Engeza isithombe','Oketša seswantšho'],['Change photo','Verander foto','Shintsha isithombe','Fetola seswantšho'],
['Ask Inno-Verse','Vra Inno-Verse','Buza i-Inno-Verse','Botšiša Inno-Verse'],['Ask about your profit, costs or stock','Vra oor jou wins, koste of voorraad','Buza ngenzuzo, izindleko noma isitoko sakho','Botšiša ka poelo, ditshenyegelo goba setoko sa gago'],['Hi. Ask me about your profit, expenses or stock.','Hallo. Vra my oor jou wins, uitgawes of voorraad.','Sawubona. Ngibuze ngenzuzo, izindleko noma isitoko sakho.','Dumela. Mpotšiše ka poelo, ditshenyegelo goba setoko sa gago.'],['Terms and conditions','Bepalings en voorwaardes','Imigomo nemibandela','Melao le dipehelo'],['Privacy policy','Privaatheidsbeleid','Inqubomgomo yobumfihlo'],['Choose your plan','Kies jou plan','Khetha uhlelo lwakho','Kgetha thulaganyo ya gago'],['Listen','Luister','Lalela','Theeletša'],['Speak','Praat','Khuluma','Bolela']];
const DICT={af:{},zu:{},nso:{}};TB.forEach(r=>{DICT.af[r[0]]=r[1];DICT.zu[r[0]]=r[2];if(r[3])DICT.nso[r[0]]=r[3]});
DICT.ve={Menu:'Menyu',Home:'Hayani',Close:'Vala','Sign in':'Dzhena','Log in':'Dzhena','Sign up':'Ṅwalisa','Log out':'Bvaha',Password:'Phasiwede',Stock:'Sitoko',Budget:'Bajete',Date:'Ḓuvha',Save:'Vhulunga',Sell:'Rengisa',Ask:'Vhudzisa',Plans:'Pulane',Quantity:'Tshivhalo'};
DICT.ts={Menu:'Menyu',Home:'Kaya',Close:'Pfala','Sign in':'Nghena','Log in':'Nghena','Sign up':'Tsarisa','Log out':'Huma',Password:'Phasiwedi',Stock:'Xitoko',Budget:'Bajete',Date:'Siku',Save:'Hlayisa',Sell:'Xavisa',Ask:'Vutisa',Plans:'Makungu',Quantity:'Nhlayo'};
const applyLang=()=>{const D=DICT[lang];if(!D)return;try{const w=document.createTreeWalker($('#app'),4);let n;while(n=w.nextNode()){const t=n.nodeValue.trim();if(D[t])n.nodeValue=n.nodeValue.replace(t,D[t])}document.querySelectorAll('#app [placeholder]').forEach(e=>{const p=e.getAttribute('placeholder');if(D[p])e.setAttribute('placeholder',D[p])})}catch(e){}};
const shrink=f=>new Promise(res=>{const r=new FileReader();r.onerror=()=>res('');r.onload=()=>{const im=new Image();im.onerror=()=>res('');im.onload=()=>{const k=Math.min(1,200/Math.max(im.width,im.height)),c=document.createElement('canvas');c.width=Math.round(im.width*k);c.height=Math.round(im.height*k);c.getContext('2d').drawImage(im,0,0,c.width,c.height);res(c.toDataURL('image/jpeg',.7))};im.src=r.result};r.readAsDataURL(f)});
let pv=-1,mo=0;
const V={};
const band=(img,a,...c)=>h('section',{class:'band',style:`background-image:linear-gradient(rgba(4,18,14,${a}),rgba(4,18,14,${a+.12})),url(${I[img]})`},h('div',{class:'in'},c));
const TD=['Track daily sales and stock of clothes','Record services and daily takings','Keep food costs and sales in order','Record sales, repairs and expenses','Count stock and see profit per item','Record harvest sales and farm costs'];
const info=(t,x)=>h('div',{class:'g'},h('h3',{},t),h('p',{},x));
V.home=()=>band('arrow',.35,h('div',{class:'hero2'},h('div',{},h('span',{class:'tag'},'For small and informal businesses'),h('h1',{},'Daily records, monthly profit and annual statements for your business.'),h('p',{class:'lead'},'Know if you made a profit, every month.'),h('div',{class:'row'},btn('Sign up','signup'),btn('Sign in','login',1)))));
V.about=()=>h('div',{class:'g narrow'},h('h2',{},'About Inno-Verse'),h('p',{},'Inno-Verse helps small and informal businesses record daily sales, expenses and stock. It works out your profit each month and prepares your annual financial statements.'),h('p',{class:'m'},'It is a bookkeeping platform, not a bank.'),h('div',{class:'row'},btn('Sign up','signup'),btn('Sign in','login',1)));
V.signup=()=>h('div',{class:'g narrow'},h('h2',{},'Register your business'),form([F('Owner full name','owner'),F('Business name','biz'),F('Business type','type','text',TYPES),F('Formal or informal','reg','text',['Informal','Formal']),F('Registration number (formal only)','regno','text',0,1),F('Phone number (you can log in with it)','phone','tel'),F('Email (optional)','email','email',0,1),F('Province','prov','text',PROV),F('Years trading','yrs','number'),F('Number of employees','emp','number'),F('Password (6 or more characters)','pw','password'),F('Confirm password','pw2','password'),h('label',{class:'ck'},h('input',{type:'checkbox',name:'terms',required:''}),'I accept the terms and the privacy policy')],doSignup,'Create account'),h('p',{},'Already registered? ',h('a',{href:'#login'},'Log in')));
V.login=()=>loginBox('user');
V.admin=u=>{if(!u)return db.users.some(x=>x.role==='admin')?loginBox('admin'):h('div',{class:'g narrow'},h('h2',{},'Create the admin account'),form([F('Email','email','email'),F('Password','pw','password')],doSetup,'Create admin'));
const us=db.users.filter(x=>x.role==='user'),p=db.cfg.prices;
return[h('div',{class:'g'},h('h2',{},'Platform settings'),form([F('Starter price (R)','p1','number',0,0,p[1]),F('Business price (R)','p2','number',0,0,p[2]),F('Pro price (R)','p3','number',0,0,p[3]),F('Free plan transactions per month','free','number',0,0,db.cfg.free)],(d,f)=>{db.cfg.prices=[0,+d.p1,+d.p2,+d.p3];db.cfg.free=+d.free;save();say(f,'Saved')},'Save settings')),
h('div',{class:'g'},h('h2',{},'Businesses ('+us.length+')'),tbl(['Business','Owner','Type','Plan','Status','Actions'],us.map(x=>[x.biz,x.owner,x.type,h('select',{onchange:e=>{x.plan=+e.target.value;save();render(1)}},PN.map((n,i)=>h('option',i===x.plan?{value:i,selected:''}:{value:i},n))),x.off?'Suspended':'Active',h('span',{},h('button',{class:'sm',onclick:()=>{x.off=x.off?0:1;save();render()}},x.off?'Activate':'Suspend'),h('button',{class:'sm',onclick:()=>{db.users=db.users.filter(y=>y!==x);save();render()}},'Delete'))])))]};
V.dash=u=>{const s=stats(u,month()),v=verdict(s);
return[h('div',{class:'g'},h('h2',{},u.biz),h('p',{class:'v '+v[0]},v[1]),voice(u,`Here is how ${u.biz} is doing this month. ${v[1]} You brought in ${R(s.i)} and spent ${R(s.e)}.`)),h('div',{class:'cards'},card('Income this month',R(s.i)),card('Expenses this month',R(s.e)),card(s.p<0?'Loss this month':'Profit this month',R(s.p)),card('Plan',PN[u.plan])),chart(u,month().slice(0,4)),h('div',{class:'g'},h('h2',{},'Recent transactions'),tbl(['Date','Category','Description','Amount'],[...u.tx].sort((a,b)=>b.d.localeCompare(a.d)).slice(0,5).map(x=>[x.d,x.cat,x.desc,(x.type==='in'?'+':'-')+R(x.amt)])))]};
V.tx=u=>{const n=u.tx.filter(x=>x.d.startsWith(month())).length,lim=u.plan===0?db.cfg.free:Infinity;
return[h('div',{class:'g'},h('h2',{},'Record a transaction'),u.plan===0?h('p',{},`Free plan: ${n} of ${lim} transactions used this month`):'',form([F('Type','type','text',['Sales income','Expense']),F('Category','cat','text',CAT),F('Description','desc','text',0,1),F('Amount (R)','amt','number'),h('label',{},'Date',h('input',{type:'date',name:'date',value:today(),max:today(),required:''})),u.plan>=1?[F('Stock item','item','text',['None',...u.stock.map(s=>s.name)]),F('Quantity','qty','number',0,1)]:''],(d,f)=>{
const a=+d.amt;if(!(a>0))return say(f,'Enter an amount above zero');
if(!d.date||d.date>today())return say(f,'Choose a date that is today or earlier');
if(u.plan===0&&u.tx.filter(x=>x.d.startsWith(d.date.slice(0,7))).length>=db.cfg.free)return say(f,'Monthly limit reached for that month. Upgrade your plan');
const t={id:crypto.randomUUID(),d:d.date,type:d.type==='Expense'?'out':'in',cat:d.cat,desc:d.desc||'',amt:a};
if(d.item&&d.item!=='None'){const s=u.stock.find(x=>x.name===d.item),q=+d.qty||1;if(t.type==='in'){if(s.qty<q)return say(f,'Not enough stock');s.qty-=q}else s.qty+=q;t.item=s.name;t.q=q}
u.tx.push(t);save();render()},'Save')),
h('div',{class:'g'},h('h2',{},'Latest transactions'),tbl(['Date','Type','Category','Description','Amount',''],[...u.tx].sort((a,b)=>b.d.localeCompare(a.d)).slice(0,30).map(x=>[x.d,x.type==='in'?'Income':'Expense',x.cat,x.desc,R(x.amt),h('button',{class:'sm',onclick:()=>{const s=x.item&&u.stock.find(i=>i.name===x.item);if(s)s.qty+=x.type==='in'?x.q:-x.q;u.tx=u.tx.filter(y=>y.id!==x.id);save();render()}},'Delete')])))]};
V.stock=u=>{const l=lock(u,1,'Stock taking');if(l)return l;const tp=u.stock.reduce((a,s)=>a+s.qty*(s.price-s.cost),0),msg=h('p',{class:'m'}),td=today();
return[h('div',{class:'g'},h('h2',{},'Add stock item'),form([F('Item name','name'),F('Quantity','qty','number'),F('Cost price (R)','cost','number'),F('Selling price (R)','price','number'),h('label',{},'Photo (optional)',h('input',{type:'file',name:'photo',accept:'image/*'}))],async d=>{const img=d.photo&&d.photo.size?await shrink(d.photo):'';u.stock.push({name:d.name.trim(),qty:+d.qty,cost:+d.cost,price:+d.price,img});save();render(1)},'Add item')),
h('div',{class:'g'},h('h2',{},'Stock and sales'),h('p',{},'Press Sell each time you sell. The amount is worked out for you and the stock goes down.'),msg,tbl(['Item','In stock','Cost','Price','Profit each','Sold today','Sell','Count'],u.stock.map(s=>{const q=h('input',{type:'number',min:'1',value:'1',style:'width:70px'}),c=h('input',{type:'number',min:'0',value:s.qty,style:'width:80px'}),ts=u.tx.filter(x=>x.d===td&&x.type==='in'&&x.item===s.name),sq=ts.reduce((a,x)=>a+x.q,0),sa=ts.reduce((a,x)=>a+x.amt,0);
const it=h('span',{},s.img?h('img',{src:s.img,alt:s.name,class:'th'}):'',s.name+(s.qty<=5?' (low)':''),h('br'),h('label',{class:'filebtn'},s.img?'Change photo':'Add photo',h('input',{type:'file',accept:'image/*',style:'display:none',onchange:async e=>{const f=e.target.files[0];if(!f)return;const i=await shrink(f);if(i){s.img=i;save();render(1)}}})));
return[it,s.qty,R(s.cost),R(s.price),R(s.price-s.cost),`${sq} sold, ${R(sa)}`,h('span',{},q,' ',h('button',{class:'sm',onclick:()=>{const k=Math.floor(+q.value);if(!(k>0))return msg.textContent='Enter a quantity';if(s.qty<k)return msg.textContent=`Only ${s.qty} ${s.name} in stock`;s.qty-=k;u.tx.push({id:crypto.randomUUID(),d:td,type:'in',cat:'Sales',desc:`Sold ${k} x ${s.name}`,amt:k*s.price,item:s.name,q:k});save();render(1)}},'Sell')),h('span',{},c,' ',h('button',{class:'sm',onclick:()=>{s.qty=+c.value;save();render(1)}},'Update'),' ',(()=>{let sure=0;const d=h('button',{class:'sm',onclick:()=>{if(sure){u.stock=u.stock.filter(i=>i!==s);save();render(1)}else{sure=1;d.textContent='Press again to delete'}}},'Delete');return d})())]})),
h('p',{class:'v '+(tp>=0?'win':'lose')},`If you sell all your stock at these prices you will make ${R(tp)} (selling price minus cost price).`),h('p',{},'Stock value at cost: '+R(u.stock.reduce((a,s)=>a+s.qty*s.cost,0))))]};
let av='daily';
const dk=t=>t.toLocaleDateString('sv');
const rng=(u,a,b)=>{const t=u.tx.filter(x=>x.d>=a&&x.d<=b),i=sum(t,'in'),e=sum(t,'out');return{t,i,e,p:i-e}};
const fcast=(v,m)=>{const k=v.length;if(k<2)return Array(m).fill(k?v[0]:0);const mx=(k-1)/2,my=v.reduce((a,b)=>a+b,0)/k;let sxy=0,sxx=0;v.forEach((y,i)=>{sxy+=(i-mx)*(y-my);sxx+=(i-mx)**2});const sl=sxy/sxx;return Array.from({length:m},(_,j)=>my+sl*(k+j-mx))};
const mkfd=(E,P,m)=>{const fe=fcast(E,m).map(v=>Math.max(0,v)),fp=fcast(P,m);return fe.map((e,j)=>({e,p:fp[j],i:e+fp[j]}))};
V.analytics=u=>{const l=lock(u,1,'Analytics');if(l)return l;
const now=new Date(),at=o=>{const t=new Date(now);t.setDate(t.getDate()+o);return t},mon=-((now.getDay()+6)%7),sh=t=>`${t.getDate()}/${t.getMonth()+1}`,lg=t=>`${t.getDate()} ${MN[t.getMonth()]}`,y=month().slice(0,4),cm=+month().slice(5,7);
let ac,lb,fl,cur,w,unit,ttl,pr,fw,rows;
if(av==='daily'){const ds=[...Array(14)].map((_,i)=>at(i-13));ac=ds.map(t=>rng(u,dk(t),dk(t)));lb=ds.map(sh);fl=[1,2,3,4,5,6,7].map(o=>sh(at(o)));cur=ac[13];w='today';unit='day';ttl='Expenses and profit, last 14 days with a 7 day forecast';pr='In the last 14 days';fw='the next 7 days';rows=ds.map((t,i)=>[lg(t),ac[i]]).reverse()}
else if(av==='weekly'){const ws=[...Array(8)].map((_,i)=>at(mon+(i-7)*7));ac=ws.map(t=>{const e=new Date(t);e.setDate(e.getDate()+6);return rng(u,dk(t),dk(e))});lb=ws.map(sh);fl=[1,2,3,4].map(j=>sh(at(mon+7*j)));cur=ac[7];w='this week';unit='week';ttl='Expenses and profit, last 8 weeks with a 4 week forecast (weeks start on Monday)';pr='In the last 8 weeks';fw='the next 4 weeks';rows=ws.map((t,i)=>[lg(t),ac[i]]).reverse()}
else{const mm=i=>`${y}-${String(i+1).padStart(2,'0')}`;ac=[...Array(cm)].map((_,i)=>rng(u,mm(i)+'-01',mm(i)+'-31'));lb=MN.slice(0,cm);fl=MN.slice(cm);cur=rng(u,y+'-01-01',y+'-12-31');w='this year';unit='month';ttl=`Expenses and profit in ${y} with a forecast to December`;pr='So far this year';fw='the rest of the year';rows=ac.map((r,i)=>[MN[i],r]).reverse()}
const n=ac.length,fd=fl.length?mkfd(ac.map(x=>x.e),ac.map(x=>x.p),fl.length):[],fs=fd.reduce((a,x)=>a+x.p,0),sold={};
cur.t.filter(x=>x.type==='in'&&x.item).forEach(x=>{const o=sold[x.item]||(sold[x.item]={q:0,a:0});o.q+=x.q;o.a+=x.amt});
const v=cur.p>0?['win',`profit of ${R(cur.p)}`]:cur.p<0?['lose',`loss of ${R(-cur.p)}`]:['',cur.i?'break even':'no records yet'];
return[h('div',{class:'g'},h('h2',{},'Analytics'),h('div',{class:'seg'},[['daily','Daily'],['weekly','Weekly'],['yearly','Yearly']].map(([k,t])=>h('button',{class:av===k?'on':'alt',onclick:()=>{av=k;render(1)}},t))),
h('p',{class:'v '+v[0]},`${w[0].toUpperCase()+w.slice(1)}: ${v[1]}.`),
h('div',{class:'cards'},card('Sales',R(cur.i)),card('Expenses',R(cur.e)),card(cur.p<0?'Loss':'Profit',R(cur.p)),card('Number of sales',cur.t.filter(x=>x.type==='in').length))),
plot(ttl,[...lb,...fl],ac,n,1,unit,pr,fd),
fl.length?h('div',{class:'g'},h('p',{class:'v '+(fs>=0?'win':'lose')},`Forecast for ${fw}: ${fs>=0?'profit':'loss'} of ${R(Math.abs(fs))}`+(av==='yearly'?`. Estimated profit for the whole year: ${R(cur.p+fs)}.`:'.')),h('p',{class:'m'},'The forecast is a simple trend estimate from your records. It is not a guarantee. More records make it better.')):'',
h('div',{class:'g'},h('h2',{},'Items sold '+w),Object.keys(sold).length?tbl(['Item','Quantity','Amount'],Object.entries(sold).map(([k,o])=>[k,o.q,R(o.a)])):h('p',{},'No stock sales recorded yet.')),
h('div',{class:'g'},h('h2',{},unit==='day'?'Day by day':unit==='week'?'Week by week':'Month by month'),tbl([unit==='day'?'Day':unit==='week'?'Week starting':'Month','Sales','Expenses','Profit or loss'],rows.map(([k,r])=>[k,R(r.i),R(r.e),R(r.p)])))]};
V.budget=u=>{const s=stats(u,month()),c={};s.t.filter(x=>x.type==='out').forEach(x=>c[x.cat]=(c[x.cat]||0)+x.amt);
const cs=Object.entries(c).sort((a,b)=>b[1]-a[1]),top=cs[0],b=u.bud.b,g=u.bud.g,pc=b?Math.min(100,s.e/b*100):0;
const tl=top?`${top[0]} costs you the most: ${R(top[1])}, which is ${Math.round(top[1]/s.e*100)}% of your expenses.`:'No expenses recorded this month.';
let gl='Set a profit goal to see if you are on track.';
if(g)gl=s.p>=g?'You have reached your profit goal.':`You are ${R(g-s.p)} short of your profit goal of ${R(g)}.`+(top?` ${top[0]} is why you are not reaching it. Reduce it first.`:'');
const bl=b?(s.e>b?`You are ${R(s.e-b)} over your expense budget.`:`You have ${R(b-s.e)} left in your budget.`):'Set an expense budget to track it.';
return[h('div',{class:'g'},h('h2',{},'Budget'),form([F('Monthly expense budget (R)','b','number',0,0,b),F('Monthly profit goal (R)','g','number',0,0,g)],d=>{u.bud={b:+d.b,g:+d.g};save();render()},'Save budget')),
h('div',{class:'g'},h('h2',{},'Where your money goes'),h('div',{class:'bar'},h('i',{style:`width:${pc}%`})),h('p',{},bl),tbl(['Cost','Amount','Share'],cs.map(([n,a],i)=>[i?n:'Highest: '+n,R(a),Math.round(a/s.e*100)+'%'])),h('p',{class:'v '+(!g?'':s.p<g?'lose':'win')},tl+' '+gl),voice(u,`${tl} ${gl} ${bl}`))]};
V.reports=u=>{rm=rm||month();const s=stats(u,rm),y=rm.slice(0,4),T=stats(u,y);
const rows=[...Array(12)].map((_,i)=>{const m=`${y}-${String(i+1).padStart(2,'0')}`,t=stats(u,m);return[m,R(t.i),R(t.e),R(t.p)]});
return[h('div',{class:'g'},h('h2',{},'Monthly report'),h('label',{},'Month',h('input',{type:'month',value:rm,onchange:e=>{rm=e.target.value||month();render()}})),h('div',{class:'cards'},card('Income',R(s.i)),card('Expenses',R(s.e)),card(s.p<0?'Loss':'Profit',R(s.p)),card('Result',s.p>0?'Profit':s.p<0?'Loss':'Break even'))),
lock(u,2,'Annual statements')||h('div',{class:'g'},h('h2',{},'Annual financial statement '+y),h('p',{},u.biz+', '+u.type),tbl(['Month','Income','Expenses','Profit or loss'],[...rows,['Total',R(T.i),R(T.e),R(T.p)]]),h('p',{},'Closing stock value at cost: '+R(u.stock.reduce((a,x)=>a+x.qty*x.cost,0))),h('button',{onclick:()=>print()},'Print or save as PDF'))]};

V.qr=u=>{const l=lock(u,2,'QR code');if(l)return l;const b=h('div',{class:'qr'});setTimeout(()=>{try{new QRCode(b,{text:`INNOVERSE|${u.biz}|${u.id}`,width:220,height:220})}catch(e){b.textContent='QR code could not load'}},0);
return h('div',{class:'g'},h('h2',{},'Your payment QR code'),h('p',{},'Customers scan this code to pay '+u.biz+'.'),b,h('button',{onclick:()=>print()},'Print QR code'))};
V.plan=u=>{const i=pv<0?u.plan:pv,F2=[[`Up to ${db.cfg.free} transactions a month`,'Budget and cost analysis','Profit and expenses graph'],['Unlimited transactions','Stock taking with profit per item','Sell button that updates your stock','Photos on stock items','Daily, weekly and yearly analytics with forecast'],['Annual financial statements','Payment QR code'],['Voice over of your results']];
return[h('div',{class:'g'},h('h2',{},'Choose your plan'),h('div',{class:'seg'},PN.map((n,j)=>h('button',{class:j===i?'on':'alt',onclick:()=>{pv=j;render(1)}},n+' '+price(j))))),
h('div',{class:'g'},h('h2',{},PN[i]+' plan, '+price(i)+' a month'),h('ul',{},F2.slice(0,i+1).flat().filter((x,n)=>i===0||n).map(t=>h('li',{},t))),i===u.plan?h('p',{},'Your current plan'):h('button',{onclick:()=>{u.plan=i;save();pv=-1;render()}},'Switch to '+PN[i]),h('p',{class:'m'},'Payment is not connected yet, so switching is free for now.'))]};
const getAI=async()=>{try{return window.claude?await window.claude.use('sample'):null}catch(e){return null}};
const LNAME={en:'English',af:'Afrikaans',zu:'isiZulu',nso:'Sepedi',ve:'Tshivenda',ts:'Xitsonga'};
const brief=u=>{const n=new Date(),m=rng(u,dk(new Date(n.getFullYear(),n.getMonth(),1)),dk(n)),pm=rng(u,dk(new Date(n.getFullYear(),n.getMonth()-1,1)),dk(new Date(n.getFullYear(),n.getMonth(),0))),t=rng(u,dk(n),dk(n)),c={};m.t.filter(x=>x.type==='out').forEach(x=>c[x.cat]=(c[x.cat]||0)+x.amt);
return JSON.stringify({today:dk(n),business:u.biz,type:u.type,plan:PN[u.plan],todaySoFar:{sales:t.i,expenses:t.e,profit:t.p},thisMonth:{sales:m.i,expenses:m.e,profit:m.p,expensesByCategory:c},lastMonth:{sales:pm.i,expenses:pm.e,profit:pm.p},profitGoal:u.bud.g,expenseBudget:u.bud.b,stock:u.stock.map(i=>({name:i.name,qty:i.qty,cost:i.cost,price:i.price}))})};
V.ask=u=>{const orb=h('div',{class:'orb'},h('i'),h('i'),h('i'),h('i')),log=h('div',{class:'log'}),pro=u.plan>=3,st=c=>{orb.className='orb '+c};
const add=(w,t)=>{chat.push([w,t]);const p=h('p',{class:'b '+w},t);log.append(p);log.scrollTop=log.scrollHeight;return p};
const fin=t=>{if(pro){st('on');speak(t,()=>st(''))}else st('')};
const type=(p,t)=>{const ws=t.split(' ');let i=0;p.textContent='';const iv=setInterval(()=>{p.textContent=ws.slice(0,++i).join(' ');log.scrollTop=log.scrollHeight;if(i>=ws.length){clearInterval(iv);fin(t)}},35)};
const fb=()=>{const ex=u.stock[0]?u.stock[0].name:'Coke';return`I did not catch that. Try: "What is costing me the most?", "How many ${ex} did I sell today?" or "What is my forecast?"`};
const ask=async q=>{q=q.trim();if(!q)return;add('me',q);st('on');const a=answer(u,q);
if(a!==null){const p=add('ai','');chat[chat.length-1][1]=a;type(p,a);return}
const ai=await getAI();
if(!ai){const t=fb();add('ai',t);fin(t);return}
const p=add('ai','Thinking...'),hist=chat.slice(-7,-2).map(([w,t])=>(w==='me'?'User: ':'Assistant: ')+t).join('\n');
try{const r=await ai(`You are the assistant inside Inno-Verse, a bookkeeping app for small businesses in South Africa. Answer in at most four short sentences, in the language the user writes in (default ${LNAME[lang]}). Money is in rand. Use only the business data below for numbers. If the data does not contain the answer, say so briefly. Give general business tips when asked, but no legal or tax advice.\nBusiness data: ${brief(u)}\nRecent chat:\n${hist}\nUser question: ${q}`,{modelTier:'quick',cache:false,onText:({text})=>{p.textContent=text;log.scrollTop=log.scrollHeight}});p.textContent=r.text;chat[chat.length-1][1]=r.text;fin(r.text)}
catch(e){const t=(e&&e.code==='not_granted'?'':'I could not reach the assistant right now. ')+fb();p.textContent=t;chat[chat.length-1][1]=t;st('')}};
if(!chat.length)chat.push(['ai','Hi. Ask me about your profit, expenses or stock.']);
chat.forEach(([w,t])=>log.append(h('p',{class:'b '+w},t)));
return h('div',{class:'g narrow'},h('h2',{},'Ask Inno-Verse'),orb,log,
h('form',{class:'ask',onsubmit:e=>{e.preventDefault();const i=e.target.q;ask(i.value);i.value=''}},h('input',{name:'q',placeholder:'Ask about your profit, costs or stock',autocomplete:'off'}),h('button',{},'Ask'),pro&&SR?h('button',{type:'button',class:'alt',onclick:()=>{try{const r=new SR();r.lang=({af:'af-ZA',zu:'zu-ZA'})[lang]||'en-ZA';r.onresult=e=>ask(e.results[0][0].transcript);r.onend=()=>{if(orb.className.includes('fast'))st('')};st('on fast');r.start()}catch(e){st('')}}},'Speak'):''),
h('div',{class:'row'},['What is costing me the most?','Am I making a profit?','How is my stock?','What did I sell today?','Give me tips','What is my forecast?'].map(t=>h('button',{class:'sm alt',onclick:()=>ask(t)},t))),
pro?'':h('p',{class:'m'},'Spoken answers and voice questions are on the Pro plan.'),
window.claude?h('p',{class:'m'},'Questions I cannot answer from your records are sent to Claude together with a short summary of your business numbers.'):'')};
V.terms=()=>h('div',{class:'g narrow'},h('h2',{},'Terms and conditions'),h('p',{},'Inno-Verse is a bookkeeping tool. It is not a bank and does not hold customer money.'),h('p',{},'You are responsible for the accuracy of the records you enter and for your tax and registration duties.'),h('p',{},'Paid plans are charged the monthly price shown on the Plans page.'),h('p',{},'We may suspend accounts that are used for fraud or abuse.'));
V.privacy=()=>h('div',{class:'g narrow'},h('h2',{},'Privacy policy'),h('p',{},'We collect your business details and the records you enter to run your account.'),h('p',{},'Passwords are stored as salted hashes and are never shown to anyone, including the admin.'),h('p',{},'We do not sell your data. You can ask the admin to delete your account at any time.'));
function render(ns){const u=U();let k=location.hash.slice(1)||'home';if(!V[k])k='home';
if(u&&u.role==='admin'&&!['admin','terms','privacy'].includes(k))k='admin';
else if(u&&u.role==='user'&&['login','signup','admin','home'].includes(k))k='dash';
else if(!u&&!PUB.includes(k))k='login';
const items=u?(u.role==='admin'?[['admin','Admin']]:MENU):[['home','Home'],['about','About'],['login','Sign in'],['signup','Sign up']];
const pick=v=>{mo=0;go(v)};
document.body.style.backgroundImage=`linear-gradient(rgba(4,18,14,.7),rgba(4,18,14,.82)),url(${I[BG[k]]})`;
const pn=u&&u.role==='user'?h('p',{},'Plan: '+PN[u.plan]+' '+price(u.plan)+' ',h('button',{class:'sm',onclick:()=>{pv=-1;pick('plan')}},'Switch plan')):'';
const panel=mo?h('div',{class:'panel'},pn,items.map(([v,t])=>h('button',{class:v===k?'alt on':'alt',onclick:()=>pick(v)},t)),u?h('button',{onclick:()=>{mo=0;cur=null;go('home')}},'Log out'):''):'';
const tog=h('button',{class:'alt',onclick:()=>{mo=mo?0:1;render(1)}},mo?'Close':'Menu');
const quick=u?'':h('nav',{},h('button',{class:'alt',onclick:()=>pick('login')},'Sign in'),h('button',{onclick:()=>pick('signup')},'Sign up'));
const hd=h('header',{},tog,h('div',{class:'logo',style:`background-image:url(${I.key})`}),h('b',{},'Inno-Verse'),h('select',{class:'lang','aria-label':'Language',onchange:e=>{lang=e.target.value;S('bl_lang',lang);render(1)}},LANGS.map(([c,n])=>h('option',c===lang?{value:c,selected:''}:{value:c},n))),quick);
$('#app').replaceChildren(hd,panel,h('main',{class:k==='home'?'wide':''},V[k](u)),h('footer',{},h('a',{href:'#terms'},'Terms and conditions'),h('a',{href:'#privacy'},'Privacy policy')),h('button',{class:'top',onclick:()=>scrollTo(0,0)},'Top'));if(panel.style)panel.style.top=hd.offsetHeight+'px';$('#app').className=mo?'shift':'';applyLang();if(!ns){scrollTo(0,0);try{speechSynthesis.cancel()}catch(e){}}}
addEventListener('hashchange',()=>render());render();
