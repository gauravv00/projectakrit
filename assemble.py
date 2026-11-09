import os
import re

# Read original files
with open('a_head.html', 'r', encoding='utf-8') as f:
    head_content = f.read()

with open('b_core.js', 'r', encoding='utf-8') as f:
    core_content = f.read()

with open('c_views.js', 'r', encoding='utf-8') as f:
    views_content = f.read()

with open('d_views2.js', 'r', encoding='utf-8') as f:
    views2_content = f.read()

# 1. Update saveFile in core_content to support browser downloads
old_save = """async function saveFile(name,data){
 const dl=await cap('downloads');
 if(!dl){toast('Saving files is not available in this view.');return false}
 try{await dl.save({filename:name,data});toast('Saved '+name);return true}
 catch(e){if(!e||e.code!=='declined')toast('Could not save the file ('+(e&&e.code||'error')+').');return false}}"""

new_save = """async function saveFile(name,data){
 try{const dl=await cap('downloads');if(dl&&dl.save){await dl.save({filename:name,data});toast('Saved '+name);return true}}catch(e){}
 try{
  const mime=name.endsWith('.png')?'image/png':'application/pdf';
  const blob=data instanceof Blob?data:new Blob([data],{type:mime});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');
  a.href=url;a.download=name;document.body.appendChild(a);a.click();
  setTimeout(()=>{document.body.removeChild(a);URL.revokeObjectURL(url)},1200);
  toast('Saved '+name);return true;
 }catch(x){toast('Could not save file: '+(x.message||x));return false}
}"""

if old_save in core_content:
    core_content = core_content.replace(old_save, new_save)
    print("Updated saveFile in core_content")
elif "new Blob([data]" in core_content:
    print("saveFile already updated in core_content")

# 2. Update REC in core_content to reflect confirmed MPCB authorized recyclers from sample document
old_rec = """const REC={
 r1:{id:'r1',name:'Vasai Recyclers Pvt Ltd',lic:'MH-CPCB-2024-R0092',base:'Vasai',vehicle:'Tempo (Tata Ace)'},
 r2:{id:'r2',name:'Eco Recyclers',lic:'MH-CPCB-2023-R0147',base:'Navi Mumbai',vehicle:'Tempo (Tata Ace)'},
 r3:{id:'r3',name:'Kurla E-Cycle Works',lic:'MH-CPCB-2025-R0031',base:'Kurla',vehicle:'Pickup van (Mahindra Bolero)'}};"""

new_rec = """const REC={
 r1:{id:'r1',name:'Eco-Recycling Ltd (Ecoreco)',lic:'MPCB/RO(HQ)/E-Waste/2024-R0072',base:'Vasai East (7,200 MT)',vehicle:'Tempo (Tata Ace)'},
 r2:{id:'r2',name:'Evergreen Recyclekaro India',lic:'MPCB/RO(HQ)/E-Waste/2023-R0147',base:'Wada, Palghar (R2 & ISO)',vehicle:'Tempo (Tata Ace)'},
 r3:{id:'r3',name:'Justdispose Recycling Pvt Ltd',lic:'MPCB/RO(HQ)/E-Waste/2024-R0120',base:'Vasai East (1,200 MT)',vehicle:'Pickup van (Mahindra Bolero)'},
 r4:{id:'r4',name:'E-Incarnation Recycling',lic:'MPCB/RO(HQ)/E-Waste/2024-R0095',base:'Tarapur, Palghar (950 MT)',vehicle:'Heavy Tempo'}};"""

if old_rec in core_content:
    core_content = core_content.replace(old_rec, new_rec)
    print("Updated REC in core_content")
elif "Eco-Recycling Ltd (Ecoreco)" in core_content:
    print("REC already updated in core_content")

# 2.5 Integrate Live Express Backend Sync & Server-Sent Events (SSE)
sync_start = '/* ================= sync (shared store) ================= */'
sync_end = 'const _caps={};'
if sync_start in core_content and sync_end in core_content:
    new_sync_code = """/* ================= sync (shared store & backend API) ================= */
let syncing=false;
const API_URL = (typeof window !== 'undefined' && window.location && window.location.origin) ? window.location.origin : 'http://localhost:3000';

async function trySync(){
 if(syncing||isOffline()||!S.queue.length)return;
 syncing=true;let n=0;
 try{
  for(const q of [...S.queue]){
   const rec=(q.k==='m'?S.local.m:S.local.p)[q.id];
   if(!rec)continue;
   if(S.db){
    await S.db.doc((q.k==='m'?'manifests/':'pickups/')+q.id).set(rec);
   } else {
    const ep = q.k==='m' ? '/api/manifests' : '/api/pickups';
    const isUpdate = q.k==='m' && rec.status !== 'pending';
    let url = API_URL + ep;
    let method = 'POST';
    if(isUpdate){
      url = API_URL + '/api/manifests/' + encodeURIComponent(rec.id) + '/verify';
      method = 'PATCH';
    }
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rec)
    });
    if(!res.ok) throw new Error('API sync failed: ' + res.status);
   }
   S.queue=S.queue.filter(x=>!(x.k===q.k&&x.id===q.id));
   n++;
  }
  S.dbState='live';
  persist();
  if(S.ui.wasOffline&&n){
    S.ui.wasOffline=false;
    const p=prof();
    if(p&&p.role==='kabadi')push(S.lang==='en'?`Back online. ${n} handover${n>1?'s are':' is'} now registered.`:'नेटवर्क वापस आ गया। आपके हैंडओवर दर्ज हो गए।');
  }
 } catch(e){
  if(!isOffline()) S.dbState='local';
 } finally {
  syncing=false;
  softRender();
 }
}

async function initDb(){
 setTimeout(()=>{if(S.loading){S.loading=false;softRender()}},1200);
 try {
  const manifestsRes = await fetch(API_URL + '/api/manifests');
  if(manifestsRes.ok) {
   const data = await manifestsRes.json();
   if(data.manifests && Array.isArray(data.manifests)) {
    const o = {};
    data.manifests.forEach(m => { o[m.id] = m; });
    S.remote.m = o;
   }
   try {
     const pickupsRes = await fetch(API_URL + '/api/pickups');
     if(pickupsRes.ok) {
       const pData = await pickupsRes.json();
       if(pData.pickups && Array.isArray(pData.pickups)) {
         const op = {};
         pData.pickups.forEach(p => { op[p.id] = p; });
         S.remote.p = op;
       }
     }
   } catch(pe) {}

   S.dbState = 'live';
   S.loading = false;
   bump();
   checkNotifs();
   softRender();
   trySync();

   if(typeof EventSource !== 'undefined') {
    try {
      const evtSource = new EventSource(API_URL + '/api/events');
      evtSource.onmessage = e => {
        try {
          const payload = JSON.parse(e.data);
          if(payload.type === 'insert' || payload.type === 'update') {
            if(payload.collection === 'manifests' && payload.item) {
              S.remote.m[payload.item.id] = payload.item;
              bump();
              checkNotifs();
              softRender();
            } else if(payload.collection === 'pickups' && payload.item) {
              S.remote.p[payload.item.id] = payload.item;
              bump();
              softRender();
            }
          }
        } catch(err) {}
      };
    } catch(se) {}
   }
   return;
  }
 } catch(apiErr) {}

 try{
  const cl=window.claude;if(!cl||!cl.use){S.dbState='local';return}
  const db=await cl.use('db');if(!db){S.dbState='local';softRender();return}
  S.db=db;S.dbState='live';
  const got=()=>{S.loading=false;bump();checkNotifs();softRender();trySync()};
  const bad=e=>{S.dbState='error';S.loading=false;softRender()};
  db.collection('manifests').onSnapshot(sn=>{const o={};sn.docs.forEach(d=>{o[d.id]=d.data()});S.remote.m=o;got()},bad);
  db.collection('pickups').onSnapshot(sn=>{const o={};sn.docs.forEach(d=>{o[d.id]=d.data()});S.remote.p=o;got()},bad);
 }catch(e){S.dbState='local'}
}

"""
    idx1 = core_content.index(sync_start)
    idx2 = core_content.index(sync_end)
    core_content = core_content[:idx1] + new_sync_code + core_content[idx2:]
    print("Replaced sync & initDb with live Express API & SSE in core_content")
elif "API_URL" in core_content:
    print("Live Express backend sync already integrated in core_content")

# 3. Add Project Vision button in demobar
old_demobar = """function demobar(){
 const [lab,cls]=dbLabel(),inApp=S.view==='app'||S.view==='onboard'||S.view==='recycler'||S.pub;
 return`<div class="demobar"><div class="gut"><div class="col">
  <strong class="tag" style="font-weight:700">Akrit demo</strong>
  ${inApp?`<button type="button" data-act="home">${ic('user')}Switch role</button>`:''}
  <button type="button" data-act="recdesk">${ic('truck')}Recycler desk</button>
  <button type="button" data-act="offline" aria-pressed="${S.offline}">${ic('wifioff')}Test offline</button>
  <span class="tag" style="margin-left:auto;display:inline-flex;align-items:center;gap:6px"><span class="${cls}"></span>${lab}</span>
 </div></div></div>`}"""

new_demobar = """function demobar(){
 const [lab,cls]=dbLabel(),inApp=S.view==='app'||S.view==='onboard'||S.view==='recycler'||S.pub;
 return`<div class="demobar"><div class="gut"><div class="col">
  <strong class="tag" style="font-weight:700">Akrit demo</strong>
  ${inApp?`<button type="button" data-act="home">${ic('user')}Switch role</button>`:''}
  <button type="button" data-act="recdesk">${ic('truck')}Recycler desk</button>
  <button type="button" data-act="offline" aria-pressed="${S.offline}">${ic('wifioff')}Test offline</button>
  <button type="button" data-act="about-open">${ic('shield')}Project Vision</button>
  <span class="tag" style="margin-left:auto;display:inline-flex;align-items:center;gap:6px"><span class="${cls}"></span>${lab}</span>
 </div></div></div>`}"""

if old_demobar in views_content:
    views_content = views_content.replace(old_demobar, new_demobar)
    print("Updated demobar in views_content")
elif "about-open" in views_content:
    print("demobar already has about-open")

# 4. Add aboutModal definition and wire into overlays
about_modal_code = """function aboutModal(){
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
"""

old_overlays = """function overlays(){return logOverlay()+successOverlay()+puOverlay()+reportModal()+manifestOverlay()+supportSheet()}
function closeTop(){
 if(S.ui.sheet)S.ui.sheet=false;else if(S.ui.manifest)S.ui.manifest=null;else if(S.ui.modal)S.ui.modal=null;else if(S.ui.pu)S.ui.pu=null;else if(S.ui.success)S.ui.success=null;else if(S.ui.log)S.ui.log=null;else return false;
 render();return true}"""

new_overlays = about_modal_code + """function overlays(){return logOverlay()+successOverlay()+puOverlay()+reportModal()+manifestOverlay()+supportSheet()+aboutModal()}
function closeTop(){
 if(S.ui.about)S.ui.about=false;else if(S.ui.sheet)S.ui.sheet=false;else if(S.ui.manifest)S.ui.manifest=null;else if(S.ui.modal)S.ui.modal=null;else if(S.ui.pu)S.ui.pu=null;else if(S.ui.success)S.ui.success=null;else if(S.ui.log)S.ui.log=null;else return false;
 render();return true}"""

if old_overlays in views_content:
    views_content = views_content.replace(old_overlays, new_overlays)
    print("Updated overlays in views_content")
elif "aboutModal" in views_content:
    print("aboutModal already present in views_content")

# 5. Add about actions to ACT in views2_content
old_act_anchor = """const ACT={
 lang(el){S.lang=el.dataset.v;persist();document.documentElement.lang=S.lang;render()},"""

new_act_anchor = """const ACT={
 'about-open'(){S.ui.about=true;S.ui.fo=true;render()},
 'about-close'(el,e){if(el.classList.contains('overlay')&&e.target.closest('[data-stop]'))return;S.ui.about=false;render()},
 lang(el){S.lang=el.dataset.v;persist();document.documentElement.lang=S.lang;render()},"""

if old_act_anchor in views2_content:
    views2_content = views2_content.replace(old_act_anchor, new_act_anchor)
    print("Updated ACT in views2_content")
elif "'about-open'" in views2_content:
    print("about-open already present in views2_content")

# Save updated modular files
with open('b_core.js', 'w', encoding='utf-8') as f:
    f.write(core_content)

with open('c_views.js', 'w', encoding='utf-8') as f:
    f.write(views_content)

with open('d_views2.js', 'w', encoding='utf-8') as f:
    f.write(views2_content)

print("Updated modular js files.")

# Assembled full index.html
head_body_split = head_content.split('<div id="app"></div>')
head_upper = head_body_split[0]

modern_meta = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
<meta name="theme-color" content="#0D5C63">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="description" content="Akrit - Digital E-Waste Supply Chain & Digital Manifest Layer for India's Informal Recycling Sector">
"""

cleaned_head = re.sub(r'^<title>Akrit</title>', modern_meta + '<title>Akrit — Digital E-Waste Supply Chain</title>', head_upper)

assembled_html = f"""{cleaned_head}
</head>
<body>
<div id="app"></div>
<div id="toasts" role="status" aria-live="polite"></div>

<script>
{core_content}

{views_content}

{views2_content}
</script>
</body>
</html>
"""

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(assembled_html)

print("Generated index.html successfully! Size:", len(assembled_html), "bytes")
