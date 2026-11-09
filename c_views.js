/* ================= views ================= */
IC.wrench='<path d="M14.5 6.5a4 4 0 0 0-5 5l-6 6a2 2 0 0 0 3 3l6-6a4 4 0 0 0 5-5l-2.5 2.5-2.5-.5-.5-2.5z"/>';
const app=$('#app');
const reduced=()=>window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
const isNarrow=()=>window.innerWidth<900;
function col(inner,cls=''){return`<div class="gut"><div class="col ${cls}">${inner}</div></div>`}
const langBar=dark=>`<div class="lang ${dark?'dark':''}" role="group" aria-label="${t('language')}">${LANGS.map(([c,l])=>`<button type="button" data-act="lang" data-v="${c}" aria-pressed="${S.lang===c}" lang="${c}">${l}</button>`).join('')}</div>`;
function sChip(s){const x={verified:['ok','check'],pending:['warn','clock'],flagged:['bad','x']}[s];return`<span class="chip ${x[0]}">${ic(x[1])}${t('status.'+s)}</span>`}
const genLabel=m=>{const p=prof();return(m.named&&!(p&&p.anonymize))?esc(m.gname):`Anonymised <span class="mono">${esc(m.gcode)}</span>`};
const photoOrIcon=(m,cls='thumb')=>m.photo?`<img class="${cls}" loading="lazy" alt="Photo of ${esc(CAT[m.cat].en.toLowerCase())}" src="${m.photo}">`:`<span class="${cls}">${cic(m.cat).replace('<svg','<svg style="width:28px;height:28px;stroke:currentColor;fill:none;stroke-width:2"')}</span>`;
const skel=n=>Array.from({length:n},()=>'<div class="sk" style="height:76px;border-radius:14px"></div>').join('');
function go(fn){const f=()=>{fn();render()};if(document.startViewTransition&&!reduced()){try{document.startViewTransition(f);return}catch(e){}}f()}
function readImg(file,max=170,q=.6){return new Promise((res,rej)=>{const fr=new FileReader();fr.onload=()=>{const im=new Image();im.onload=()=>{const k=Math.min(1,max/Math.max(im.width,im.height)),c=document.createElement('canvas');c.width=Math.max(1,Math.round(im.width*k));c.height=Math.max(1,Math.round(im.height*k));c.getContext('2d').drawImage(im,0,0,c.width,c.height);res(c.toDataURL('image/jpeg',q))};im.onerror=rej;im.src=fr.result};fr.onerror=rej;fr.readAsDataURL(file)})}
function samplePhoto(){const c=document.createElement('canvas');c.width=c.height=150;const x=c.getContext('2d');x.fillStyle='#CFDCDC';x.fillRect(0,0,150,150);x.strokeStyle='#9DB5B6';x.lineWidth=2;for(let i=-150;i<150;i+=22){x.beginPath();x.moveTo(i,150);x.lineTo(i+150,0);x.stroke()}x.fillStyle='#0D5C63';x.font='700 18px sans-serif';x.textAlign='center';x.fillText('SAMPLE',75,82);return c.toDataURL('image/jpeg',.6)}
function cacheSave(){try{const o=Object.values(S.remote.m).slice(-200).map(m=>({...m,photo:null}));localStorage.setItem('akrit.cache',JSON.stringify(o))}catch(e){}}
function cacheLoad(){try{const a=JSON.parse(localStorage.getItem('akrit.cache')||'[]');const o={};a.forEach(m=>{o[m.id]=m});S.remote.m=o}catch(e){}}
const relDay=ts=>{const d=Math.round((sod(ts)-sod(Date.now()))/DAY);return d===0?'today':d===1?'tomorrow':new Date(ts).toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'short'})};
const dbLabel=()=>({live:['Shared data','dotlive'],local:['This device only','dotlive off'],readonly:['View only for you','dotlive off'],error:['Sync problem','dotlive off'],connecting:['Connecting','dotlive off']}[S.dbState]||['','dotlive off']);

/* ================= shell ================= */
function demobar(){
 const [lab,cls]=dbLabel(),inApp=S.view==='app'||S.view==='onboard'||S.view==='recycler'||S.pub;
 return`<div class="demobar"><div class="gut"><div class="col">
  <strong class="tag" style="font-weight:700">Akrit demo</strong>
  ${inApp?`<button type="button" data-act="home">${ic('user')}Switch role</button>`:''}
  <button type="button" data-act="recdesk">${ic('truck')}Recycler desk</button>
  <button type="button" data-act="offline" aria-pressed="${S.offline}">${ic('wifioff')}Test offline</button>
  <button type="button" data-act="about-open">${ic('shield')}Project Vision</button>
  <span class="tag" style="margin-left:auto;display:inline-flex;align-items:center;gap:6px"><span class="${cls}"></span>${lab}</span>
 </div></div></div>`}

function render(){
 let h=demobar();
 if(S.pub)h+=viewPublic();
 else if(S.view==='select')h+=viewSelect();
 else if(S.view==='onboard')h+=viewOnboard();
 else if(S.view==='recycler')h+=viewRecycler();
 else if(S.role==='kabadi')h+=viewKabadi();
 else if(S.role==='shop')h+=viewShop();
 else if(S.role==='compliance')h+=viewCompliance();
 h+=overlays();
 app.innerHTML=h;after();
}
function softRender(){
 const a=document.activeElement;
 if(a&&/^(INPUT|SELECT|TEXTAREA)$/.test(a.tagName)&&a.type!=='button'&&app.contains(a)){S.ui.pending=true;return}
 render()}
document.addEventListener('focusout',()=>{if(S.ui.pending){setTimeout(()=>{const a=document.activeElement;if(!(a&&/^(INPUT|SELECT|TEXTAREA)$/.test(a.tagName))){S.ui.pending=false;render()}},120)}});

function after(){
 animateDial();
 if(S.ui.fo){S.ui.fo=false;const f=$$('.overlay [data-first]').pop();if(f)f.focus({preventScroll:true})}
 const p=prof();
 if(p&&p.role==='shop'&&$('.gbadge.unlock')&&!p.badgeSeen){setTimeout(()=>{p.badgeSeen=true;persist()},1900)}
}
function animateDial(){
 const el=$('#dial');if(!el)return;
 const target=Math.min(100,Math.max(0,+el.dataset.pct||0)),from=S.ui.dialLast??0,arc=$('.arc',el),txt=$('text',el),C=2*Math.PI*48;
 const set=v=>{arc.style.strokeDasharray=`${C*v/100} ${C}`;txt.textContent=Math.round(v)+'%';el.classList.toggle('ok',v>=70)};
 if(reduced()||from===target){set(target);S.ui.dialLast=target;return}
 set(from);const t0=performance.now();let crossed=false;
 (function step(now){const k=Math.min(1,(now-t0)/1000),e=1-Math.pow(1-k,3),v=from+(target-from)*e;set(v);
  if(!crossed&&from<70&&v>=70){crossed=true;el.classList.add('pulse');try{navigator.vibrate&&navigator.vibrate(35)}catch(x){}}
  if(k<1)requestAnimationFrame(step);else S.ui.dialLast=target})(t0)}

/* ================= role select & onboarding ================= */
function viewSelect(){
 const defs=[['kabadi','k','truck'],['shop','s','wrench'],['compliance','c','building']];
 const cards=defs.map(([r,c,i])=>{const p=S.profiles[r];return`<button type="button" class="rolecard ${c}" data-act="pick" data-v="${r}"><span class="ico">${ic(i)}</span><span><b>${t('role.'+c)}</b><span class="d">${t('role.'+c+'.d')}</span></span>${p?`<span class="cont chip info">${t('resume')}</span>`:''}</button>`}).join('');
 return col(`<div class="page">
  <div class="row sp"><span class="brandmark" style="color:var(--primary-ink)"><span style="width:40px;height:40px;border-radius:12px;background:var(--primary);color:#fff;display:grid;place-items:center">${ic('mark')}</span>Akrit</span>${langBar(true)}</div>
  <h1 class="h1" style="margin:30px 0 16px">${t('role.q')}</h1>
  <div class="stack" style="gap:14px">${cards}</div>
  <p class="muted" style="margin-top:20px;font-size:.9rem">Each role has its own sign-up and its own screens. Records you create here are shared between roles, so a handover logged as a kabadiwala shows up for the recycler and the compliance officer.</p>
 </div>`)}

const OB={kabadi:['phone','otp','photo'],shop:['phone','otp','shop'],compliance:['email','company','verify']};
const KZONES=['Dharavi','Kurla','Andheri','Navi Mumbai','Thane','Vasai'];
function viewOnboard(){
 const o=S.ob,steps=OB[o.role],id=steps[o.step],d=o.d,c=o.role==='compliance';
 const bind=(k,extra='')=>`data-bind="ob.d.${k}" value="${esc(d[k]??'')}" ${extra}`;
 let body='',title='';
 if(id==='phone'){title=t('phone');body=`<div class="field"><label for="f-ph">${t('phone')}</label><div class="row"><span class="chip mute" style="min-height:52px;padding:0 14px;font-size:1rem">+91</span><input id="f-ph" type="tel" inputmode="numeric" maxlength="10" autocomplete="tel-national" placeholder="98XXXXXXXX" ${bind('phone')}></div><div class="err" id="err" role="alert"></div></div><button class="btn btn-primary btn-block" data-act="ob-next">${t('sendotp')}</button>`}
 else if(id==='otp'){title=t('otp');body=`<p class="muted" style="margin-bottom:14px">+91 ${esc(d.phone||'')}</p><div class="field"><label for="f-otp">${t('otp')}</label><input id="f-otp" class="otp" type="text" inputmode="numeric" maxlength="6" autocomplete="one-time-code" placeholder="••••••" ${bind('otp')}><div class="hint">Demo: the OTP is <b class="mono">123456</b>.</div><div class="err" id="err" role="alert"></div></div><button class="btn btn-primary btn-block" data-act="ob-next">${t('verify')}</button>`}
 else if(id==='photo'){title=t('selfie');body=`<label class="photo-btn" style="margin-bottom:16px">${d.photo?`<img alt="Your photo" src="${d.photo}">`:`${ic('camera').replace('class="i "','class="i" style="width:48px;height:48px"')}<span>${t('selfie')}</span>`}<input type="file" accept="image/*" capture="user" data-photo="ob.d" aria-label="${t('selfie')}"></label>
   ${d.photo?'':`<button type="button" class="link" data-act="ob-sample">${t('samplephoto')}</button>`}
   <div class="field" style="margin-top:8px"><span class="lbl">${t('area')}</span><div class="seg" role="radiogroup" aria-label="${t('area')}">${KZONES.map(z=>`<button type="button" role="radio" aria-checked="${(d.zone||'Dharavi')===z}" data-act="ob-zone" data-v="${z}">${z}</button>`).join('')}</div></div>
   <div class="field"><label for="f-nm">${t('name_opt')}</label><input id="f-nm" type="text" autocomplete="given-name" ${bind('name')}></div>
   <div class="err" id="err" role="alert"></div><button class="btn btn-primary btn-block" data-act="ob-next">${t('finish')}</button>`}
 else if(id==='shop'){title='Your shop';body=`<div class="field"><label for="f-sn">Shop name</label><input id="f-sn" type="text" autocomplete="organization" ${bind('shopName')}></div>
   <div class="field"><span class="lbl">Photo of the shop signboard</span><label class="photo-btn">${d.photo?`<img alt="Shop signboard" src="${d.photo}">`:`${ic('camera').replace('class="i "','class="i" style="width:40px;height:40px"')}<span>Tap to photograph the signboard</span>`}<input type="file" accept="image/*" capture="environment" data-photo="ob.d" aria-label="Photograph the shop signboard"></label>${d.photo?'':`<button type="button" class="link" data-act="ob-sample">${t('samplephoto')}</button>`}</div>
   <div class="field"><label for="f-gst">GST number <span class="muted">(optional for now)</span></label><input id="f-gst" type="text" maxlength="15" autocapitalize="characters" placeholder="27ABCDE1234F1Z5" ${bind('gst')}><div class="hint">You need it later to earn the Green Shop badge.</div></div>
   <div class="field"><label for="f-z">Area</label><select id="f-z" data-bind="ob.d.zone">${Object.keys(ZONES).map(z=>`<option ${((d.zone||'Grant Road')===z)?'selected':''}>${z}</option>`).join('')}</select></div>
   <div class="err" id="err" role="alert"></div><button class="btn btn-primary btn-block" data-act="ob-next">${t('finish')}</button>`}
 else if(id==='email'){title='Work email';body=`<div class="field"><label for="f-nm">Your name</label><input id="f-nm" type="text" autocomplete="name" ${bind('name')}></div><div class="field"><label for="f-em">Work email</label><input id="f-em" type="email" autocomplete="email" placeholder="name@yourcompany.com" ${bind('email')}><div class="hint">We verify the company domain. Personal addresses such as Gmail are not accepted.</div></div><div class="err" id="err" role="alert"></div><button class="btn btn-primary btn-block" data-act="ob-next">Continue</button>`}
 else if(id==='company'){title='Company';body=`<div class="field"><label for="f-co">Company name</label><input id="f-co" type="text" autocomplete="organization" ${bind('company')}></div><div class="field"><label for="f-id">CIN or GSTIN</label><input id="f-id" type="text" autocapitalize="characters" maxlength="21" placeholder="21-character CIN or 15-character GSTIN" ${bind('idNo')}><div class="hint">CIN example: L12345MH2000PLC123456. GSTIN example: 27ABCDE1234F1Z5.</div></div><div class="err" id="err" role="alert"></div><button class="btn btn-primary btn-block" data-act="ob-next">Continue</button>`}
 else if(id==='verify'){title='Verify email';body=`<p class="muted" style="margin-bottom:14px">We sent a 6-digit code to <b>${esc(d.email||'')}</b>.</p><div class="field"><label for="f-otp">Verification code</label><input id="f-otp" class="otp" type="text" inputmode="numeric" maxlength="6" placeholder="••••••" ${bind('otp')}><div class="hint">Demo: the code is <b class="mono">123456</b>.</div><div class="err" id="err" role="alert"></div></div><button class="btn btn-primary btn-block" data-act="ob-next">Verify and open dashboard</button>`}
 const pct=Math.round((o.step+1)/steps.length*100);
 const top=`<div class="row sp" style="margin-bottom:18px"><button type="button" class="btn btn-ghost btn-sm" data-act="ob-back">${ic('back')}${t('back')}</button>${langBar(true)}</div>`;
 if(c)return col(`<div class="page pc">${top}<div style="display:grid;grid-template-columns:minmax(0,1fr);gap:18px" class="obgrid"><div class="card lift"><div class="row sp" style="margin-bottom:8px"><span class="eyebrow">Step ${o.step+1} of ${steps.length}</span><span class="eyebrow">${pct}%</span></div><div class="prog" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pct}" aria-label="Sign-up progress"><i style="width:${pct}%"></i></div><h1 class="h1" style="margin:18px 0 14px" data-first tabindex="-1">${title}</h1>${body}</div>
  <div class="card flat"><h3 style="margin-bottom:10px">What you get</h3><ul class="vlist"><li class="done"><span class="dot">${ic('check')}</span><span>One EPR dashboard for every recycler you work with</span></li><li class="done"><span class="dot">${ic('check')}</span><span>Digital manifests with weights, licences, GPS and QR codes</span></li><li class="done"><span class="dot">${ic('check')}</span><span>A CPCB-ready PDF report in one click</span></li></ul></div></div></div>`,'mid');
 return col(`<div class="page">${top}<div class="steps" aria-hidden="true">${steps.map((_,i)=>`<i class="${i<=o.step?'on':''}"></i>`).join('')}</div><p class="eyebrow" style="margin:10px 0 6px">${o.step+1} / ${steps.length}</p><h1 class="h1" style="margin-bottom:18px" data-first tabindex="-1">${title}</h1>${body}</div>`)}

function obNext(){
 const o=S.ob,d=o.d,id=OB[o.role][o.step],err=m=>{const e=$('#err');if(e)e.textContent=m;return false};
 if(id==='phone'&&!/^[6-9]\d{9}$/.test(d.phone||''))return err('Enter a valid 10-digit mobile number.');
 if((id==='otp'||id==='verify')&&(d.otp||'')!=='123456')return err('That code is not right. Try 123456 in this demo.');
 if(id==='photo'&&!d.photo)return err('Take a photo of your face to continue.');
 if(id==='shop'){if(!(d.shopName||'').trim())return err('Enter your shop name.');if(!d.photo)return err('Add a photo of the shop signboard.');
  if(d.gst&&!/^\d{2}[A-Z]{5}\d{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/.test(d.gst.toUpperCase()))return err('That GST number does not look right. Leave it empty to add it later.')}
 if(id==='email'){if(!(d.name||'').trim())return err('Enter your name.');if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(d.email||''))return err('Enter a valid email address.');if(FREE_MAIL.test(d.email))return err('Use your company email. Personal addresses are not accepted.')}
 if(id==='company'){if(!(d.company||'').trim())return err('Enter the company name.');const v=(d.idNo||'').toUpperCase().trim();
  if(!(/^[LU]\d{5}[A-Z]{2}\d{4}[A-Z]{3}\d{6}$/.test(v)||/^\d{2}[A-Z]{5}\d{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/.test(v)))return err('Enter a valid 21-character CIN or 15-character GSTIN.');d.idNo=v}
 if(o.step<OB[o.role].length-1){o.step++;render();return}
 const base={id:'u'+rid4()+rid4(),createdAt:Date.now()};let p;
 if(o.role==='kabadi')p={...base,role:'kabadi',phone:d.phone,name:(d.name||'').trim(),photo:d.photo,zone:d.zone||'Dharavi',aadhaarLast4:null,named:false};
 else if(o.role==='shop')p={...base,role:'shop',phone:d.phone,shopName:d.shopName.trim(),signboard:d.photo,gst:(d.gst||'').toUpperCase(),zone:d.zone||'Grant Road',badgeSeen:false,named:true};
 else p={...base,role:'compliance',email:d.email,name:d.name.trim(),company:d.company.trim(),idType:d.idNo.length===21?'CIN':'GSTIN',idNo:d.idNo,connected:[],target:1200,kgPerCredit:1,anonymize:false,includeSample:true};
 S.profiles[o.role]=p;S.role=o.role;S.view='app';S.ob=null;S.tab[o.role]=o.role==='compliance'?'overview':'home';persist();render();window.scrollTo(0,0)}

/* ================= kabadiwala ================= */
function bottomNav(items,cur){return`<nav class="nav" aria-label="Main">${col(items.map(([k,l,i])=>`<button type="button" data-act="tab" data-v="${k}" ${cur===k?'aria-current="page"':''}>${ic(i)}<span>${l}</span></button>`).join(''))}</nav>`}
const fab=()=>`<div class="fabwrap"><div class="col"><button type="button" class="fab" data-act="support">${ic('call')}${t('call')}</button></div></div>`;
const offBanner=()=>isOffline()?`<div class="offline" role="status"><div class="gut"><div class="col">${ic('wifioff')}<span>${t('offline')}</span></div></div></div>`:'';

function viewKabadi(){
 const p=prof(),tab=S.tab.kabadi;
 const hdr=`<header class="appbar"><div class="gut"><div class="col"><div><div class="sub">${t('hello')}</div><h1>${esc(p.name||('•••'+p.phone.slice(-4)))}</h1></div>${langBar()}</div></div></header>`;
 let b='';
 if(tab==='home')b=kHome();else if(tab==='coll')b=kColl();else b=kEarn();
 return hdr+offBanner()+col(`<main class="page">${b}</main>`)+bottomNav([['home',t('home'),'home'],['coll',t('coll'),'list'],['earn',t('earn'),'rupee']],tab)+fab()}

function kHome(){
 const ms=mine(),t0=sod(Date.now()),td=ms.filter(m=>m.pickupAt>=t0&&m.status!=='flagged');
 const val=m=>m.status==='verified'?amountOf(m):amountExp(m);
 const tot=sum(td,val),conf=sum(td.filter(m=>m.status==='verified'),amountOf),wait=tot-conf,extra=tot*(1-MIDDLE),wk=ms.filter(m=>m.pickupAt>=Date.now()-7*DAY).length;
 return`<div class="stack" style="gap:16px">
  <button type="button" class="cta-big" data-act="log">${ic('camera')}<b>${t('logcta')}</b><span>${t('logsub')}</span></button>
  <div class="stats"><div class="card stat big"><div class="v" id="todayv">${inr(tot)}</div><div class="l">${t('today')}</div>${wait>0?`<div class="l" style="margin-top:6px">${inr(conf)} ${t('confirmed')} · ${inr(wait)} ${t('waiting')}</div>`:''}</div><div class="card stat"><div class="v">${wk}</div><div class="l">${t('week')}</div></div></div>
  <div class="card motiv"><div class="row sp"><span class="eyebrow">${t('extra')}</span></div><div class="extra">${t('extra')}: ${inr(extra)}</div>
   <div class="track" role="img" aria-label="${t('middle')} ${inr(tot*MIDDLE)}. ${t('youget')} ${inr(tot)}."><span class="a" style="width:${tot?MIDDLE*100:100}%"></span><span class="b" style="width:${tot?(1-MIDDLE)*100:0}%"></span></div>
   <div class="legend"><span>${t('middle')}: ${inr(tot*MIDDLE)}</span><span>${t('youget')}: ${inr(tot)}</span></div></div>
  ${ms.length?'':`<div class="card flat empty"><h3>${t('none_coll')}</h3><p class="muted">${t('none_sub')}</p><button type="button" class="link" data-act="sample-load">${t('sample_load')}</button></div>`}
 </div>`}

function mItem(m){
 const uns=S.queue.some(q=>q.k==='m'&&q.id===m.id),amt=amountOf(m);
 return`<button type="button" class="item" data-act="open-m" data-id="${m.id}">${photoOrIcon(m)}<span class="grow"><span class="t">${catWord(m.cat)} · ${nf(m.wv??m.wl)} kg</span><br><span class="mono muted" style="font-size:.78rem">${m.id}</span><br><span class="muted" style="font-size:.8rem">${fmtD(m.pickupAt)}</span></span><span style="text-align:right;display:flex;flex-direction:column;gap:6px;align-items:flex-end">${sChip(m.status)}${uns?`<span class="chip mute">${ic('clock')}Waiting to sync</span>`:''}<b class="num">${amt!=null?inr(amt):'~'+inr(amountExp(m))}</b></span></button>`}

function kColl(){
 const ms=mine().sort((a,b)=>b.pickupAt-a.pickupAt);
 return`<h2 class="h2" style="margin-bottom:12px">${t('coll')}</h2><div class="stack" style="gap:10px">${S.loading&&!ms.length?skel(4):ms.length?ms.map(mItem).join(''):`<div class="card flat empty"><h3>${t('none_coll')}</h3><p class="muted">${t('none_sub')}</p><button type="button" class="link" data-act="sample-load">${t('sample_load')}</button></div>`}</div>`}

function kEarn(){
 const p=prof(),ms=mine().filter(m=>m.status!=='flagged'),val=m=>m.status==='verified'?amountOf(m):amountExp(m),ver=ms.filter(m=>m.status==='verified');
 const days=[...Array(7)].map((_,i)=>{const s=sod(Date.now()-(6-i)*DAY);return{l:new Date(s).toLocaleDateString('en-IN',{weekday:'short'}),v:sum(ms.filter(m=>m.pickupAt>=s&&m.pickupAt<s+DAY),val)}});
 const mx=Math.max(1,...days.map(d=>d.v)),byCat=CATS.map(c=>({c,kg:sum(ver.filter(m=>m.cat===c.id),m=>m.wv),amt:sum(ver.filter(m=>m.cat===c.id),amountOf)})).filter(x=>x.kg>0);
 return`<div class="stack" style="gap:14px"><div class="card stat big"><div class="l">${t('earn')} · ${t('confirmed')}</div><div class="v">${inr(sum(ver,amountOf))}</div><div class="l">${nf(sum(ver,m=>m.wv))} kg · ${ver.length}</div></div>
 <div class="card"><h3 style="margin-bottom:10px">Last 7 days</h3><div class="bars" role="img" aria-label="Earnings for the last 7 days">${days.map(d=>`<div><b>${d.v?inr(d.v):''}</b><i style="height:${Math.max(3,d.v/mx*78)}px"></i><span>${d.l}</span></div>`).join('')}</div></div>
 <div class="card"><h3 style="margin-bottom:10px">${t('rates')}</h3><div class="rates">${CATS.map(c=>`<div><span style="font-family:var(--font-head);font-weight:800;font-size:1rem">${S.lang==='mr'?c.mr:c.hi}</span><b>${inr(c.rate)}</b><span class="muted">${inr(c.rate*MIDDLE)}</span></div>`).join('')}</div><p class="muted" style="font-size:.8rem;margin-top:8px">${t('youget')} / ${t('middle')} (sample rates)</p></div>
 ${byCat.length?`<div class="card"><h3 style="margin-bottom:6px">${t('category')}</h3>${byCat.map(x=>`<div class="row sp" style="min-height:44px;border-bottom:1px solid var(--line)"><span>${catWord(x.c.id)} <span class="muted">${nf(x.kg)} kg</span></span><b class="num">${inr(x.amt)}</b></div>`).join('')}</div>`:''}
 <div class="card" style="border-color:var(--amber-strong)"><div class="row" style="align-items:flex-start">${ic('shield')}<div class="grow"><b>${t('aadhaar')}</b>
  ${p.aadhaarLast4?`<p class="chip ok" style="margin-top:8px">${ic('check')}Aadhaar •••• ${p.aadhaarLast4} linked</p>`:S.ui.aad?`<div class="field" style="margin:12px 0 8px"><label for="f-aad">12-digit Aadhaar number</label><input id="f-aad" type="text" inputmode="numeric" maxlength="12" data-bind="ui.aadv" value="${esc(S.ui.aadv||'')}"><div class="hint">Only the last 4 digits are kept on this device.</div><div class="err" id="err" role="alert"></div></div><button class="btn btn-primary btn-sm" data-act="aad-save">${t('save')}</button>`:`<button type="button" class="btn btn-outline btn-sm" style="margin-top:10px" data-act="aad-open">${t('aadhaar_btn')}</button>`}</div></div></div></div>`}

/* log flow */
function logOverlay(){
 const L=S.ui.log;if(!L)return'';
 const back=`<button type="button" class="btn btn-ghost btn-sm" data-act="log-back" aria-label="${t('back')}">${ic('back')}${t('back')}</button>`;
 let b='';
 if(L.step===1)b=`<h2 class="h1" data-first tabindex="-1" style="margin-bottom:14px">${t('step1')}</h2><label class="photo-btn" style="min-height:46vh">${ic('camera').replace('class="i "','class="i" style="width:72px;height:72px"')}<span style="font-size:1.2rem">${t('tapcam')}</span><input type="file" accept="image/*" capture="environment" data-photo="ui.log" aria-label="${t('step1')}"></label><div style="text-align:center;margin-top:8px"><button type="button" class="link" data-act="log-sample">${t('samplephoto')}</button></div>`;
 else if(L.step===2)b=`<h2 class="h1" data-first tabindex="-1" style="margin-bottom:14px">${t('step2')}</h2><div class="catgrid">${CATS.map(c=>`<button type="button" class="cat" data-act="cat" data-v="${c.id}" aria-pressed="${L.cat===c.id}"><span style="width:46px;height:46px">${cic(c.id)}</span><b>${S.lang==='mr'?c.mr:c.hi}</b><small>${c.en}</small></button>`).join('')}</div>`;
 else b=`<h2 class="h1" data-first tabindex="-1" style="margin-bottom:6px">${t('step3')}</h2><p class="muted" style="margin-bottom:22px">${catWord(L.cat)} · ${CAT[L.cat].en}</p>
  <div class="stepper"><button type="button" data-hold="-0.5" aria-label="Decrease weight">${ic('minus')}</button><div class="grow"><output id="kgv" aria-live="polite">${nf(L.kg)}</output><small>kg</small></div><button type="button" data-hold="0.5" aria-label="Increase weight">${ic('plus')}</button></div>
  <p class="card flat" style="margin:26px 0;text-align:center">${t('expect')}<br><b style="font:800 1.8rem var(--font-head)" id="expv">${inr(L.kg*CAT[L.cat].rate)}</b><br><span class="muted" style="font-size:.85rem">${inr(CAT[L.cat].rate)}/kg</span></p>
  <button type="button" class="btn btn-amber btn-block" style="min-height:68px;font-size:1.3rem" data-act="log-ok">${ic('check')}${t('confirm')}</button>`;
 return`<div class="overlay" role="dialog" aria-modal="true" aria-label="${t('logcta')}"><div class="top"><div class="gut"><div class="col">${back}<div class="grow"><div class="steps" aria-hidden="true">${[1,2,3].map(i=>`<i class="${i<=L.step?'on':''}"></i>`).join('')}</div></div>${isOffline()?`<span class="chip warn">${ic('wifioff')}Offline</span>`:''}</div></div></div>${col(`<div class="page" style="padding-bottom:60px">${b}</div>`)}</div>`}
function logAdj(dv){const L=S.ui.log;if(!L)return;L.kg=Math.min(250,Math.max(.5,Math.round((L.kg+dv)*2)/2));const a=$('#kgv'),b=$('#expv');if(a)a.textContent=nf(L.kg);if(b)b.textContent=inr(L.kg*CAT[L.cat].rate)}

function successOverlay(){
 const m=S.ui.success&&getM(S.ui.success);if(!m)return'';
 const link=mLink(m.id),msg=`Akrit handover code: ${m.id}\n${nf(m.wl)} kg of ${CAT[m.cat].en.toLowerCase()}\nVerify: ${link}`;
 const off=S.queue.some(q=>q.id===m.id)&&isOffline();
 return`<div class="overlay" role="dialog" aria-modal="true" aria-label="${t('saved')}">${col(`<div class="success"><div class="coins" aria-hidden="true">${'<span class="coin">₹</span>'.repeat(5)}</div>
  <h2 class="h1" data-first tabindex="-1">${off?t('savedoff'):t('saved')}</h2><p class="muted" style="margin:6px 0 4px">${catWord(m.cat)} · ${nf(m.wl)} kg</p><p style="font:800 1.6rem var(--font-head);color:var(--ok);margin-bottom:18px">+ ${inr(amountExp(m))}</p>
  <button type="button" class="codecard" data-act="open-m" data-id="${m.id}" aria-label="${t('viewm')}: ${m.id}"><span class="eyebrow">${t('code')}</span><div class="code">${m.id}</div><span class="muted" style="font-size:.85rem">${t('sendcode')}</span></button>
  ${off?`<p class="card flat" style="margin-top:12px;text-align:left">${ic('wifioff')} No network right now. The manifest is saved on this phone and registers by itself when you are back online.</p>`:''}
  <div class="stack" style="margin-top:18px"><a class="btn btn-wa btn-block" style="min-height:64px;font-size:1.15rem" href="https://wa.me/?text=${encodeURIComponent(msg)}" target="_blank" rel="noopener">${ic('wa')}${t('wa')}</a>
  <button type="button" class="btn btn-ghost btn-block" data-act="open-m" data-id="${m.id}">${t('viewm')}</button><button type="button" class="btn btn-primary btn-block" data-act="success-done">${t('done')}</button></div></div>`)}</div>`}

/* ================= shop ================= */
function verifs(){
 const p=prof(),ver=mine().filter(m=>m.status==='verified'),kg=sum(ver,m=>m.wv);
 return[{ok:true,l:'Phone number verified',d:'Confirmed with a one-time code at sign-up.'},
  {ok:!!p.signboard,l:'Shop signboard photo on file',d:'Added during sign-up.'},
  {ok:!!p.gst,l:'GST number added',d:'Add your GSTIN in the Green Shop tab.'},
  {ok:ver.length>=1,l:'First handover verified by a recycler',d:'Schedule a pickup. The recycler confirms the weight.'},
  {ok:kg>=25,l:'25 kg verified in total',d:`${nf(Math.min(kg,25))} of 25 kg so far.`}]}
function badgeHero(){
 const p=prof(),v=verifs(),n=v.filter(x=>x.ok).length,on=n===5,unlock=on&&!p.badgeSeen;
 return`<div class="card lift"><div class="row" style="gap:16px"><div class="gbadge ${unlock?'unlock':on?'on':''}" role="img" aria-label="Green Shop badge, ${on?'active':'locked'}">${ic('award')}</div>
  <div class="grow">${on?`<h2 class="h2">${t('s_active')}</h2><p class="muted" style="margin:4px 0 10px">${esc(p.shopName)}</p><button type="button" class="btn btn-primary btn-sm" data-act="badge-share">${ic('share')}Share badge</button>`
  :`<h2 class="h2">${t('s_verifying')}</h2><div class="prog amber" style="margin:12px 0 6px" role="progressbar" aria-valuemin="0" aria-valuemax="5" aria-valuenow="${n}" aria-label="${t('s_prog',{n})}"><i style="width:${n/5*100}%"></i></div><p class="muted" style="font-size:.9rem">${t('s_prog',{n})}</p>`}</div></div></div>`}

function pickCard(pk){
 const m=getM(pk.mid),st=m?m.status:'pending',r=REC[pk.rid];
 return`<div class="card" style="border-color:var(--primary-ink)"><div class="row sp" style="margin-bottom:8px"><span class="eyebrow">${st==='pending'?'Pickup confirmed':'Pickup completed'}</span>${m?sChip(st):''}</div>
  <b style="font:800 1.1rem var(--font-head)">${esc(r.name)}</b><div class="row wrap" style="margin-top:6px;gap:14px;color:var(--muted);font-size:.9rem"><span>${ic('truck')}${esc(pk.vehicle)}</span><span>${ic('cal')}${relDay(pk.date)}, ${pk.window}</span></div>
  <p style="margin-top:6px">${nf(pk.kg)} kg of ${CAT[pk.cat].en.toLowerCase()}${pk.notes?` · <span class="muted">${esc(pk.notes)}</span>`:''}</p>${m?`<button type="button" class="link" style="margin-top:4px;padding:0" data-act="open-m" data-id="${m.id}">${t('viewm')} · <span class="mono">${m.id}</span></button>`:''}</div>`}

function viewShop(){
 const p=prof(),tab=S.tab.shop;
 const hdr=`<header class="appbar"><div class="gut"><div class="col"><div><div class="sub">${p.zone}</div><h1>${esc(p.shopName)}</h1></div>${langBar()}</div></div></header>`;
 let b='';
 if(tab==='home'){
  const ms=mine(),ms0=sod(new Date(new Date().getFullYear(),new Date().getMonth(),1)),mm=ms.filter(m=>m.pickupAt>=ms0&&m.status!=='flagged');
  const pks=allPickups().filter(x=>x.shop===p.id).sort((a,b)=>b.date-a.date).slice(0,2);
  b=`<div class="stack" style="gap:14px">${badgeHero()}
  <div class="card"><div class="row sp"><h3>${t('month')}</h3><span class="eyebrow">${new Date().toLocaleDateString('en-IN',{month:'long'})}</span></div>
   <div class="row" style="margin:12px 0"><div class="grow"><div class="stat"><div class="v">${nf(sum(mm,m=>m.wv??m.wl))}</div><div class="l">${t('kglogged')}</div></div></div><div class="grow"><div class="stat"><div class="v">${inr(sum(mm.filter(m=>m.status==='verified'),amountOf))}</div><div class="l">${t('earned')}</div></div></div></div>
   <div class="eyebrow" style="margin-bottom:6px">${t('rates')}</div><div class="rates">${CATS.map(c=>`<div>${c.en}<b>${inr(c.rate)}</b></div>`).join('')}</div></div>
  <button type="button" class="card lift row" style="text-align:left;background:var(--primary-soft);border-color:var(--primary-ink);min-height:84px;width:100%" data-act="pu-open"><span style="width:52px;height:52px;border-radius:14px;background:var(--primary);color:#fff;display:grid;place-items:center;flex:none">${ic('truck').replace('class="i "','class="i" style="width:28px;height:28px"')}</span><span class="grow"><b style="font:800 1.15rem var(--font-head)">${t('sched')}</b><br><span class="muted">${t('sched_sub')}</span></span>${ic('back').replace('class="i "','class="i" style="transform:rotate(180deg)"')}</button>
  ${pks.map(pickCard).join('')}</div>`}
 else if(tab==='hist')b=shopHist();else b=shopBadge();
 return hdr+offBanner()+col(`<main class="page">${b}</main>`)+bottomNav([['home',t('home'),'home'],['hist',t('hist'),'list'],['badge',t('badge'),'award']],tab)+fab()}

function histRows(){
 const f=S.ui.hf||(S.ui.hf={cat:'',rid:'',from:'',to:''});
 let r=mine().filter(m=>m.role==='shop');
 if(f.cat)r=r.filter(m=>m.cat===f.cat);if(f.rid)r=r.filter(m=>m.rid===f.rid);
 if(f.from)r=r.filter(m=>m.pickupAt>=parseYmd(f.from));if(f.to)r=r.filter(m=>m.pickupAt<=parseYmd(f.to,1));
 return r.sort((a,b)=>b.pickupAt-a.pickupAt)}
const histDesc=()=>{const f=S.ui.hf||{};return[f.cat?CAT[f.cat].en:'All categories',f.rid?REC[f.rid].name:'All recyclers',(f.from||f.to)?`${f.from||'start'} to ${f.to||'today'}`:'All dates'].join(' · ')};
function histInner(){
 const rows=histRows();
 return`<div class="stack" style="gap:10px">${S.loading&&!rows.length?skel(3):rows.length?rows.map(m=>`<button type="button" class="item" data-act="open-m" data-id="${m.id}">${photoOrIcon(m)}<span class="grow"><span class="mono" style="font-size:.82rem;font-weight:600">${m.id}</span><br><span class="muted" style="font-size:.82rem">${CAT[m.cat].en} · ${fmtD(m.pickupAt)}</span><br><span style="font-size:.85rem">${REC[m.rid].name}</span></span><span style="text-align:right;display:flex;flex-direction:column;gap:6px;align-items:flex-end">${sChip(m.status)}<span class="num" style="font-size:.85rem">${m.wv!=null?nf(m.wv)+' kg verified':nf(m.wl)+' kg logged'}</span><b class="num">${amountOf(m)!=null?inr(amountOf(m)):'—'}</b></span></button>`).join(''):'<div class="card flat empty"><h3>No handovers match</h3><p class="muted">Schedule a pickup from Home, or change the filters.</p></div>'}</div>`}
function shopHist(){
 const f=S.ui.hf||(S.ui.hf={cat:'',rid:'',from:'',to:''});
 return`<div class="row sp" style="margin-bottom:12px"><h2 class="h2">${t('hist')}</h2><button type="button" class="btn btn-primary btn-sm" data-act="hist-pdf">${ic('pdf')}${t('export')}</button></div>
 <div class="filters card flat" style="margin-bottom:12px"><div class="field" style="margin:0"><label for="hf-c">${t('category')}</label><select id="hf-c" data-bind="ui.hf.cat"><option value="">All</option>${CATS.map(c=>`<option value="${c.id}" ${f.cat===c.id?'selected':''}>${c.en}</option>`).join('')}</select></div>
 <div class="field" style="margin:0"><label for="hf-r">Recycler</label><select id="hf-r" data-bind="ui.hf.rid"><option value="">All</option>${Object.values(REC).map(r=>`<option value="${r.id}" ${f.rid===r.id?'selected':''}>${r.name}</option>`).join('')}</select></div>
 <div class="field" style="margin:0"><label for="hf-f">From</label><input id="hf-f" type="date" data-bind="ui.hf.from" value="${f.from}"></div><div class="field" style="margin:0"><label for="hf-t">To</label><input id="hf-t" type="date" data-bind="ui.hf.to" value="${f.to}"></div></div>
 <div id="hbox">${histInner()}</div>`}
function shopBadge(){
 const p=prof(),v=verifs();
 return`<div class="stack" style="gap:14px">${badgeHero()}
 <div class="card"><h3 style="margin-bottom:12px">Verification checklist</h3><ul class="vlist">${v.map(x=>`<li class="${x.ok?'done':''}"><span class="dot">${x.ok?ic('check'):''}</span><span><b>${x.l}</b><br><span class="muted" style="font-size:.88rem">${x.d}</span></span></li>`).join('')}</ul>
 ${p.gst?'':`<hr><div class="field"><label for="f-gst2">GST number</label><input id="f-gst2" type="text" maxlength="15" autocapitalize="characters" placeholder="27ABCDE1234F1Z5" data-bind="ui.gst" value="${esc(S.ui.gst||'')}"><div class="err" id="err" role="alert"></div></div><button type="button" class="btn btn-primary btn-sm" data-act="gst-save">${t('save')}</button>`}</div>
 <div class="card"><div class="switch"><span><b>Show my shop name to brands</b><br><span class="muted" style="font-size:.85rem">When off, brands see an anonymised ID instead.</span></span><button type="button" role="switch" aria-checked="${p.named!==false}" aria-label="Show my shop name to brands" data-act="named"></button></div></div></div>`}

function puOverlay(){
 const u=S.ui.pu;if(!u)return'';
 if(u.done){const pk=allPickups().find(x=>x.id===u.done);return`<div class="overlay" role="dialog" aria-modal="true" aria-label="Pickup confirmed"><div class="top"><div class="gut"><div class="col"><h2 data-first tabindex="-1">${t('sched')}</h2></div></div></div>${col(`<div class="page"><div class="stack" style="gap:16px"><div class="chip ok" style="align-self:flex-start">${ic('check')}Pickup confirmed</div>${pk?pickCard(pk):''}<button type="button" class="btn btn-primary btn-block" data-act="pu-close">${t('done')}</button></div></div>`)}</div>`}
 const minD=ymd(Date.now());
 return`<div class="overlay" role="dialog" aria-modal="true" aria-label="${t('sched')}"><div class="top"><div class="gut"><div class="col"><button type="button" class="btn btn-ghost btn-sm" data-act="pu-close">${ic('x')}${t('cancel')}</button><h2 data-first tabindex="-1">${t('sched')}</h2></div></div></div>
 ${col(`<div class="page"><div class="field"><span class="lbl" id="l-cat">${t('category')}</span><div class="seg" role="radiogroup" aria-labelledby="l-cat">${CATS.map(c=>`<button type="button" role="radio" aria-checked="${u.cat===c.id}" data-act="pu-cat" data-v="${c.id}">${c.en}</button>`).join('')}</div></div>
 <div class="field"><label for="pu-kg">${t('estkg')}: <b class="num"><output id="pu-out" for="pu-kg">${u.kg}</output> kg</b></label><input id="pu-kg" type="range" min="1" max="100" step="1" value="${u.kg}" data-bind="ui.pu.kg" data-out="#pu-out"></div>
 <div class="field"><label for="pu-d">${t('pdate')}</label><input id="pu-d" type="date" min="${minD}" value="${u.date}" data-bind="ui.pu.date"></div>
 <div class="field"><label for="pu-n">${t('notes')}</label><textarea id="pu-n" data-bind="ui.pu.notes" placeholder="Gate number, who to ask for, anything the driver should know">${esc(u.notes||'')}</textarea></div>
 <div class="field"><span class="lbl">Photo of the waste <span class="muted">(optional)</span></span><label class="photo-btn" style="min-height:96px">${u.photo?`<img alt="Waste photo" src="${u.photo}" style="max-height:120px">`:`${ic('camera')}<span>Add photo</span>`}<input type="file" accept="image/*" capture="environment" data-photo="ui.pu" aria-label="Add a photo of the waste"></label></div>
 <div class="err" id="err" role="alert"></div><button type="button" class="btn btn-primary btn-block" data-act="pu-go">${ic('check')}${t('submit')}</button></div>`)}</div>`}
function puGo(){
 const p=prof(),u=S.ui.pu,date=parseYmd(u.date);
 if(isNaN(date)||date<sod(Date.now())){const e=$('#err');if(e)e.textContent='Choose today or a later date.';return}
 const rid=ZREC[p.zone]||'r2',r=REC[rid],win=new Date(date).getDay()%2?'14:00–16:00':'10:00–12:00',hr=+win.slice(0,2);
 const m=newManifest({cat:u.cat,wl:u.kg,photo:u.photo||null,photoSample:false,when:date+hr*36e5});
 const pk={id:'PK-'+rid4().toUpperCase()+rid4().toUpperCase(),shop:p.id,mid:m.id,cat:u.cat,kg:u.kg,date,window:win,rid,vehicle:u.kg>40?REC.r3.vehicle:r.vehicle,notes:(u.notes||'').trim(),u:Date.now()};
 putP(pk);u.done=pk.id;
 const a=hr<12?'am':'pm',h12=h=>h>12?h-12:h,w2=win.split('–').map(x=>h12(+x.slice(0,2))+a);
 push(`Pickup confirmed for ${relDay(date)}, ${w2[0]}–${w2[1]}. ${r.name} will collect your ${nf(u.kg)}kg of ${CAT[u.cat].en.toLowerCase()}.`);render()}

async function badgePng(){
 const p=prof(),c=document.createElement('canvas');c.width=900;c.height=520;const x=c.getContext('2d');
 x.fillStyle='#F9F7F4';x.fillRect(0,0,900,520);x.fillStyle='#0D5C63';x.fillRect(0,0,900,18);
 const g=x.createLinearGradient(80,60,300,420);g.addColorStop(0,'#F8DA94');g.addColorStop(.55,'#E0A12F');g.addColorStop(1,'#B97A14');
 x.fillStyle=g;x.beginPath();x.moveTo(190,70);x.lineTo(320,118);x.lineTo(320,270);x.lineTo(190,400);x.lineTo(60,270);x.lineTo(60,118);x.closePath();x.fill();
 x.strokeStyle='#2E1B00';x.lineWidth=14;x.lineCap='round';x.lineJoin='round';x.beginPath();x.moveTo(135,225);x.lineTo(180,270);x.lineTo(255,175);x.stroke();
 x.fillStyle='#1B2829';x.font='800 54px sans-serif';x.fillText('Green Shop',380,170);x.font='600 32px sans-serif';x.fillStyle='#0D5C63';x.fillText(p.shopName,380,225);
 x.font='400 24px sans-serif';x.fillStyle='#566466';x.fillText('E-waste handovers verified through Akrit',380,280);x.fillText('Issued '+fmtD(Date.now()),380,320);
 const b=await new Promise(r=>c.toBlob(r,'image/png'));await saveFile('Green-Shop-badge.png',b)}

/* ================= manifest document ================= */
function miniMap(m){
 const W=480,H=150,pts=[[0,98,170,70,330,92,480,50],[60,150,110,100,150,0],[300,150,330,92,420,0]];
 return`<svg viewBox="0 0 ${W} ${H}" width="100%" role="img" aria-label="Handover point at ${m.lat.toFixed(4)} N, ${m.lng.toFixed(4)} E, ${esc(m.zone)}" style="display:block"><rect width="${W}" height="${H}" fill="#E7F0F0"/>
 ${[40,80,120].map(y=>`<path d="M0 ${y}H${W}" stroke="#D2E1E2" stroke-width="1"/>`).join('')}${[80,160,240,320,400].map(x=>`<path d="M${x} 0V${H}" stroke="#D2E1E2" stroke-width="1"/>`).join('')}
 <path d="M0 98C100 90 170 70 250 82S400 60 480 50" stroke="#fff" stroke-width="9" fill="none"/><path d="M110 150C112 110 140 60 160 0" stroke="#fff" stroke-width="6" fill="none"/><path d="M330 150L342 92 420 0" stroke="#fff" stroke-width="6" fill="none"/>
 <circle cx="240" cy="78" r="26" fill="#0D5C63" opacity=".14"/><path d="M240 100s14-13 14-24a14 14 0 0 0-28 0c0 11 14 24 14 24z" fill="#0D5C63"/><circle cx="240" cy="76" r="5" fill="#fff"/>
 <text x="12" y="140" font-size="12" font-family="monospace" fill="#0D5C63">${m.lat.toFixed(5)}° N, ${m.lng.toFixed(5)}° E</text><text x="468" y="140" text-anchor="end" font-size="12" fill="#5A6668" font-family="sans-serif">${esc(m.zone)}</text></svg>`}
function manifestDoc(m){
 const r=REC[m.rid],dl=m.wv!=null?m.wv-m.wl:null,link=mLink(m.id);
 const st={verified:['ok','shield','EPR Credit Eligible'],pending:['warn','clock','Awaiting recycler confirmation'],flagged:['bad','alert','Flagged for review']}[m.status];
 return`<article class="mdoc" aria-label="Digital manifest ${m.id}"><div class="wm" aria-hidden="true"><span>SANCHAY</span></div>
 <div class="hd"><div><small>Sanchay verified</small><b>Akrit Digital Manifest</b></div><span style="width:44px;height:44px;border:2px solid rgba(255,255,255,.7);border-radius:50%;display:grid;place-items:center">${ic('shield').replace('class="i "','class="i" style="width:24px;height:24px"')}</span></div>
 <div class="body"><div class="idrow"><div><div class="eyebrow" style="color:var(--paper-muted)">Manifest ID</div><div class="mid">${m.id}</div></div><div class="qr">${qrSvg(link)}</div></div>
 <dl><dt>Generator</dt><dd>${m.named?esc(m.gname):'Anonymised '+esc(m.gcode)}<br><span style="font-weight:400;color:var(--paper-muted)">${esc(m.zone)}, Mumbai region</span></dd>
 <dt>Waste category</dt><dd>${CAT[m.cat].en}<br><span style="font-weight:400;color:var(--paper-muted)">E-waste, ${m.role==='shop'?'repair shop leftovers':'informal collection'}</span></dd></dl>
 <div class="wt"><div><small>Logged by generator</small><b>${nf(m.wl)} kg</b></div><div class="mid2">${dl==null?'→':(dl>=0?'+':'')+nf(dl)+' kg<br><span style="font-weight:400;color:var(--paper-muted)">'+(dl/m.wl*100).toFixed(1)+'%</span>'}</div><div style="text-align:right"><small>Verified by recycler</small><b>${m.wv!=null?nf(m.wv)+' kg':'Pending'}</b></div></div>
 <dl><dt>Recycler</dt><dd>${esc(r.name)}</dd><dt>CPCB licence</dt><dd class="mono" style="font-size:.82rem">${r.lic}</dd><dt>Pickup</dt><dd>${fmtDT(m.pickupAt)}</dd><dt>Delivery confirmed</dt><dd>${m.deliveredAt?fmtDT(m.deliveredAt):'Awaiting recycler'}</dd></dl>
 <div class="map">${miniMap(m)}</div>
 ${m.photo?`<img class="photo" loading="lazy" alt="Photograph of the waste at handover" src="${m.photo}">`:''}
 <div class="stamp ${st[0]}" style="margin-top:14px">${ic(st[1]).replace('class="i "','class="i" style="width:1.4em;height:1.4em"')}${st[2]}</div>
 ${m.note?`<p style="margin-top:8px;text-align:center;font-size:.85rem;color:var(--paper-muted)">${esc(m.note)}</p>`:''}
 <p class="foot">Scan the QR code to verify this manifest. Issued ${fmtD(m.pickupAt)} through Akrit and Sanchay.</p></div></article>`}
function manifestActions(m){
 const link=mLink(m.id),msg=`Akrit manifest ${m.id}: ${nf(m.wv??m.wl)} kg of ${CAT[m.cat].en.toLowerCase()}. Verify: ${link}`;
 return`<div class="stack" style="margin-top:16px"><div class="row wrap"><button type="button" class="btn btn-primary grow" data-act="m-pdf" data-id="${m.id}">${ic('pdf')}Save PDF</button><button type="button" class="btn btn-ghost grow" data-act="m-copy" data-id="${m.id}">${ic('link')}Copy link</button><a class="btn btn-ghost grow" href="https://wa.me/?text=${encodeURIComponent(msg)}" target="_blank" rel="noopener">${ic('wa')}WhatsApp</a></div>
 <p class="muted" style="font-size:.82rem;text-align:center">${ic('check')}Saved on this device. You can open it without a network.</p></div>`}
function manifestOverlay(){
 const id=S.ui.manifest;if(!id)return'';const m=getM(id);
 return`<div class="overlay" role="dialog" aria-modal="true" aria-label="Manifest ${esc(id)}"><div class="top"><div class="gut"><div class="col mid"><button type="button" class="btn btn-ghost btn-sm" data-act="m-close">${ic('back')}${t('back')}</button><h2 data-first tabindex="-1">Manifest</h2></div></div></div>${col(`<div class="page">${m?manifestDoc(m)+manifestActions(m):'<div class="card empty"><h3>Manifest not found</h3></div>'}</div>`,'mid')}</div>`}
function viewPublic(){
 const m=getM(S.pub);
 return col(`<div class="page"><div class="row sp" style="margin-bottom:14px"><span class="chip info">${ic('shield')}Verification view</span><button type="button" class="btn btn-ghost btn-sm" data-act="pub-close">Open Akrit</button></div>
 ${m?manifestDoc(m)+manifestActions(m):S.loading?`<div class="sk" style="height:520px;border-radius:8px"></div>`:`<div class="card empty">${ic('search')}<h3>No record for ${esc(S.pub)}</h3><p class="muted">This manifest is not in the shared records this page can read. Check the ID, or ask the sender for a new link.</p></div>`}</div>`,'mid')}

/* ================= overlays dispatcher ================= */
function supportSheet(){
 if(!S.ui.sheet)return'';
 return`<div class="overlay dim" data-act="sheet-close" role="dialog" aria-modal="true" aria-label="${t('call')}"><div class="sheet" data-stop><h2 class="h1" data-first tabindex="-1" style="margin-bottom:6px">${t('call')}</h2><p class="muted" style="margin-bottom:14px">A person will pick up. Demo number below.</p><div class="mono" style="font-size:1.7rem;font-weight:700;margin-bottom:16px">${SUPPORT_NO}</div><div class="stack"><a class="btn btn-primary btn-block" href="tel:${SUPPORT_NO.replace(/\s/g,'')}">${ic('call')}${t('call')}</a><button type="button" class="btn btn-ghost btn-block" data-act="copy-no">${ic('copy')}Copy number</button><button type="button" class="btn btn-ghost btn-block" data-act="sheet-close">${t('cancel')}</button></div></div></div>`}
function aboutModal(){
 if(!S.ui.about)return'';
 return`<div class="overlay dim center" data-act="about-close" role="dialog" aria-modal="true" aria-label="Project Akrit Vision & Model">
  <div class="modal" data-stop style="max-width:680px">
   <div class="row sp" style="margin-bottom:14px">
    <div class="row"><span style="width:36px;height:36px;border-radius:10px;background:var(--primary);color:#fff;display:grid;place-items:center">${ic('mark')}</span>
     <div><h2 class="h1" data-first tabindex="-1" style="font-size:1.35rem">Project Akrit</h2><span class="eyebrow" style="color:var(--primary-ink)">Zomato for India's E-Waste</span></div>
    </div>
    <button type="button" class="btn btn-ghost btn-sm" data-act="about-close" aria-label="Close">${ic('x')}</button>
   </div>
   <div class="stack" style="gap:14px;font-size:.92rem;line-height:1.55">
    <div class="card flat" style="background:var(--primary-soft);border-left:4px solid var(--primary)">
     <p><b>The Core Idea:</b> Think of Akrit like Zomato, but for e-waste. Akrit does not own recycling plants or trucks. It owns the <b>digital manifest</b>, the <b>verified supply chain</b>, and the <b>connection</b> between the informal waste generators and authorized recyclers.</p>
    </div>
    <div>
     <h3 style="font-size:1rem;margin-bottom:6px;display:flex;align-items:center;gap:6px">${ic('shield')}The Problem & Regulatory Tailwinds</h3>
     <ul style="margin:0;padding-left:18px;display:flex;flex-direction:column;gap:4px" class="muted">
      <li><b>1.75 Million MT:</b> India is world's 3rd largest e-waste generator. Maharashtra & Mumbai generate the most.</li>
      <li><b>Over 90% Informal:</b> Handled by kabadiwalas using hazardous, toxic methods without receipts or safety gear.</li>
      <li><b>CPCB 70% Target:</b> E-Waste Rules 2022 mandate brands (Samsung, Apple) recycle 70% of sales through CPCB recyclers (floor: ₹22/kg).</li>
     </ul>
    </div>
    <div>
     <h3 style="font-size:1rem;margin-bottom:6px;display:flex;align-items:center;gap:6px">${ic('user')}Empowering the Informal Sector</h3>
     <div class="grid2" style="grid-template-columns:1fr 1fr;gap:10px">
      <div class="card flat" style="padding:10px;font-size:.85rem">
       <b style="color:var(--text)">Kabadiwalas</b>
       <p class="muted">Earn ~38% more than street middlemen rates, get instant UPI payments, and gain a formal digital identity.</p>
      </div>
      <div class="card flat" style="padding:10px;font-size:.85rem">
       <b style="color:var(--text)">Repair Shops</b>
       <p class="muted">Turn component turnover into certified recycling, gain customer trust with the <b>Green Shop</b> credential, and access doorstep pickup.</p>
      </div>
     </div>
    </div>
    <div>
     <h3 style="font-size:1rem;margin-bottom:6px;display:flex;align-items:center;gap:6px">${ic('truck')}Confirmed MPCB Recycler Network</h3>
     <p class="muted" style="font-size:.82rem;margin-bottom:6px">Authorized partners within 60-90 km of Mumbai (Vasai, Palghar, Kurla) to eliminate ghost plant risks:</p>
     <div style="display:flex;flex-wrap:wrap;gap:6px">
      <span class="chip ok">${ic('check')}Ecoreco (Vasai - 7,200 MT)</span>
      <span class="chip ok">${ic('check')}Recyclekaro (Wada - R2 & ISO)</span>
      <span class="chip ok">${ic('check')}Justdispose (Vasai - 1,200 MT)</span>
      <span class="chip ok">${ic('check')}E-Incarnation (Tarapur - 950 MT)</span>
     </div>
    </div>
    <div class="card flat" style="background:var(--surface2)">
     <h3 style="font-size:.9rem;margin-bottom:4px">UN Sustainable Development Goals (SDGs)</h3>
     <div class="row wrap" style="gap:6px;font-size:.8rem">
      <span class="chip info">SDG 8: Decent Work</span>
      <span class="chip info">SDG 9: Industry & Innovation</span>
      <span class="chip info">SDG 12: Responsible Consumption</span>
     </div>
    </div>
    <div class="row wrap" style="justify-content:flex-end;margin-top:4px">
     <button type="button" class="btn btn-primary btn-sm" data-act="about-close">Close Vision Brief</button>
    </div>
   </div>
  </div>
 </div>`;
}
function overlays(){return logOverlay()+successOverlay()+puOverlay()+reportModal()+manifestOverlay()+supportSheet()+aboutModal()}
function closeTop(){
 if(S.ui.about)S.ui.about=false;else if(S.ui.sheet)S.ui.sheet=false;else if(S.ui.manifest)S.ui.manifest=null;else if(S.ui.modal)S.ui.modal=null;else if(S.ui.pu)S.ui.pu=null;else if(S.ui.success)S.ui.success=null;else if(S.ui.log)S.ui.log=null;else return false;
 render();return true}
