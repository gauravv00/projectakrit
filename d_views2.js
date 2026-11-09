/* ================= compliance officer ================= */
function cdata(){
 const p=prof(),Q=quarterOf(Date.now()),all=getAll().filter(m=>p.connected.includes(m.rid));
 const qm=all.filter(m=>m.pickupAt>=Q.start&&m.pickupAt<=Q.end),ver=qm.filter(m=>m.status==='verified'),kg=sum(ver,m=>m.wv);
 const gens=new Map();qm.forEach(m=>gens.set(m.gid,m.role));
 return{Q,all,qm,ver,kg,credits:Math.floor(kg/p.kgPerCredit),pct:kg/p.target*100,src:gens.size,kab:[...gens.values()].filter(r=>r==='kabadi').length,shops:[...gens.values()].filter(r=>r==='shop').length}}

function viewCompliance(){
 const p=prof(),tab=S.tab.compliance;
 const tabs=[['overview',t('ov'),'chart'],['manifests',t('mf'),'doc'],['recyclers',t('rc'),'truck'],['reports',t('rp'),'pdf'],['settings',t('st'),'settings']];
 const nav=`<header class="pnav"><div class="gut"><div class="col wide"><span class="brandmark" style="color:var(--primary-ink);font-size:1.25rem;margin-right:12px"><span style="width:32px;height:32px;border-radius:10px;background:var(--primary);color:#fff;display:grid;place-items:center">${ic('mark')}</span>Akrit</span>
  <nav class="tabs" aria-label="Main">${tabs.map(([k,l])=>`<button type="button" data-act="tab" data-v="${k}" ${tab===k?'aria-current="page"':''}>${l}</button>`).join('')}</nav>
  <div class="who"><b style="color:var(--text)">${esc(p.company)}</b><br>${esc(p.name)}</div>${langBar(true)}</div></div></header>`;
 let b='';
 if(tab==='overview')b=cOverview();else if(tab==='manifests')b=cManifests();else if(tab==='recyclers')b=cRecyclers();else if(tab==='reports')b=cReports();else b=cSettings();
 const pbar=`<nav class="pbar" aria-label="Main">${col(tabs.map(([k,l,i])=>`<button type="button" data-act="tab" data-v="${k}" ${tab===k?'aria-current="page"':''}>${ic(i)}<span>${l}</span></button>`).join(''),'wide')}</nav>`;
 return nav+offBanner()+col(`<main class="page pc">${b}</main>`,'wide')+pbar}

function cOverview(){
 const p=prof(),D=cdata(),C=2*Math.PI*48,last=S.ui.dialLast??0;
 const need70=Math.max(0,p.target*.7-D.kg);
 const chip=D.pct>=100?`<span class="chip ok">${ic('check')}Target met</span>`:D.pct>=70?`<span class="chip ok">${ic('check')}Above 70%</span>`:`<span class="chip warn">${ic('clock')}${nf(need70)} kg to reach 70%</span>`;
 return`<div class="row sp wrap" style="margin-bottom:16px"><div><h1 class="h1">EPR Portfolio Overview</h1><p class="muted">${D.Q.label} · ${fmtD(D.Q.start)} to ${fmtD(D.Q.end)}</p></div><button type="button" class="btn btn-amber" data-act="rep-open">${ic('pdf')}${t('genreport')}</button></div>
 ${p.connected.length?'':`<div class="cta-banner" style="margin-bottom:16px"><div><h2>${t('connect')}</h2><p style="opacity:.92;margin-top:4px;max-width:52ch">Connect the recyclers you work with. Their verified handovers appear on this dashboard as soon as they are confirmed.</p></div><button type="button" class="btn btn-amber" data-act="tab" data-v="recyclers">${ic('truck')}Connect recyclers</button></div>`}
 <div class="kpis"><div class="card kpi"><div class="eyebrow">Total kg verified this quarter</div><div class="v">${nf(D.kg)}</div><div class="s">of ${nf(p.target)} kg target</div></div>
 <div class="card kpi"><div class="eyebrow">EPR credits claimable</div><div class="v">${D.credits.toLocaleString('en-IN')}</div><div class="s">1 credit = ${nf(p.kgPerCredit)} kg verified. Change in Settings.</div></div>
 <div class="card kpi"><div class="eyebrow">Compliance vs target</div><div class="dialbox" style="margin-top:6px"><svg id="dial" class="dial ${last>=70?'ok':''}" viewBox="0 0 120 120" data-pct="${D.pct.toFixed(2)}" role="img" aria-label="Compliance ${Math.round(D.pct)} percent of target"><circle class="trk" cx="60" cy="60" r="48"/><circle class="arc" cx="60" cy="60" r="48" style="stroke-dasharray:${C*last/100} ${C}"/><text x="60" y="68" text-anchor="middle">${Math.round(last)}%</text></svg><div>${chip}<p class="s muted" style="font-size:.82rem;margin-top:8px">Target ${nf(p.target)} kg</p></div></div></div>
 <div class="card kpi"><div class="eyebrow">Active generator sources</div><div class="v">${D.src}</div><div class="s">${D.kab} collectors · ${D.shops} repair shops</div></div></div>
 <section class="card" style="margin-top:14px" aria-labelledby="mh"><div class="row sp wrap" style="margin-bottom:12px"><h2 class="h2" id="mh">Where verified handovers come from</h2><span class="muted" style="font-size:.85rem">Schematic map · heat shows verified kg</span></div>${mapBlock(D)}</section>
 <section style="margin-top:14px" aria-labelledby="th"><div class="row sp wrap" style="margin-bottom:10px"><h2 class="h2" id="th">Recent manifests</h2><button type="button" class="btn btn-ghost btn-sm" data-act="tab" data-v="manifests">View all</button></div><div id="tblbox">${tableBox(false)}</div></section>`}

function mapBlock(D){
 const W=420,H=640,LAT0=19.42,LAT1=18.90,LNG0=72.76,LNG1=73.08,px=g=>(g-LNG0)/(LNG1-LNG0)*W,py=a=>(LAT0-a)/(LAT0-LAT1)*H;
 const coast=[[19.43,72.742],[19.39,72.80],[19.33,72.815],[19.27,72.82],[19.2,72.815],[19.13,72.808],[19.07,72.815],[19.02,72.805],[18.98,72.80],[18.93,72.805],[18.89,72.815]];
 const sea='M0,0L'+coast.map(c=>px(c[1]).toFixed(1)+','+py(c[0]).toFixed(1)).join('L')+`L0,${H}Z`;
 const z={};D.ver.forEach(m=>{(z[m.zone]=z[m.zone]||{kg:0,n:0}).kg+=m.wv;z[m.zone].n++});
 const zs=Object.entries(z).sort((a,b)=>b[1].kg-a[1].kg),mx=Math.max(1,...zs.map(x=>x[1].kg));
 const heat=zs.map(([n,v])=>{const c=ZONES[n];return`<circle cx="${px(c[1]).toFixed(1)}" cy="${py(c[0]).toFixed(1)}" r="${(28+Math.sqrt(v.kg/mx)*58).toFixed(0)}" fill="url(#heat)"/>`}).join('');
 const dots=D.ver.map(m=>`<circle cx="${px(m.lng).toFixed(1)}" cy="${py(m.lat).toFixed(1)}" r="2.8" fill="var(--primary)" stroke="var(--surface)" stroke-width="1"/>`).join('');
 const lab=zs.map(([n,v])=>{const c=ZONES[n],x=px(c[1]),y=py(c[0]);return`<g><title>${n}: ${nf(v.kg)} kg in ${v.n} handovers</title><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="14" fill="var(--primary)" stroke="var(--surface)" stroke-width="2"/><text x="${x.toFixed(1)}" y="${(y+4).toFixed(1)}" text-anchor="middle" font-size="12" font-weight="700" fill="#fff" font-family="Inter,sans-serif">${v.n}</text><text x="${(x+19).toFixed(1)}" y="${(y+4).toFixed(1)}" font-size="12" font-weight="600" fill="var(--text)" font-family="Inter,sans-serif" paint-order="stroke" stroke="var(--land)" stroke-width="3">${n}</text></g>`}).join('');
 const svg=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Map of verified handovers by zone. ${zs.map(([n,v])=>n+' '+nf(v.kg)+' kilograms').join('; ')||'No verified handovers yet'}"><defs><radialGradient id="heat"><stop offset="0%" stop-color="var(--amber-strong)" stop-opacity=".75"/><stop offset="55%" stop-color="var(--amber)" stop-opacity=".32"/><stop offset="100%" stop-color="var(--amber)" stop-opacity="0"/></radialGradient></defs>
  <rect width="${W}" height="${H}" fill="var(--land)"/>${[1,2,3,4,5].map(i=>`<path d="M0 ${i*H/6}H${W}M${i*W/6} 0V${H}" stroke="var(--line)" stroke-width=".6" opacity=".6"/>`).join('')}<path d="${sea}" fill="var(--sea)"/><text x="16" y="${H/2}" font-size="13" font-style="italic" fill="var(--muted)" font-family="Inter,sans-serif" transform="rotate(-90 16 ${H/2})" text-anchor="middle">Arabian Sea</text>${heat}${dots}${lab}</svg>`;
 return`<div class="maprow"><div class="mapbox">${svg}</div><div><h3 style="margin-bottom:6px;font-size:.95rem">Verified kg by zone</h3>${zs.length?zs.map(([n,v])=>`<div class="zrow"><span><b>${n}</b></span><div class="prog" aria-hidden="true"><i style="width:${v.kg/mx*100}%"></i></div><span class="num"><b>${nf(v.kg)}</b> kg</span></div>`).join(''):`<div class="empty"><p class="muted">No verified handovers yet. Connect a recycler, then confirm a handover from the kabadiwala or shop role.</p></div>`}<p class="muted" style="font-size:.8rem;margin-top:10px">Numbers on the map show verified handovers per zone. Dots are individual handover points.</p></div></div>`}

/* manifests table */
const SORTS={id:m=>m.id,gen:m=>(m.named?m.gname:m.gcode).toLowerCase(),cat:m=>m.cat,kg:m=>m.wv??m.wl,rec:m=>REC[m.rid].name,date:m=>m.pickupAt,status:m=>({verified:0,pending:1,flagged:2})[m.status]};
const tf=()=>S.ui.tf||(S.ui.tf={q:'',status:'',cat:'',rid:'',key:'date',dir:-1,n:12,open:{}});
function tblItems(full){
 const f=tf();let r=cdata().all;
 if(full){const q=f.q.trim().toLowerCase();if(q)r=r.filter(m=>(m.id+' '+m.gname+' '+m.gcode+' '+REC[m.rid].name+' '+m.zone).toLowerCase().includes(q));if(f.status)r=r.filter(m=>m.status===f.status);if(f.cat)r=r.filter(m=>m.cat===f.cat);if(f.rid)r=r.filter(m=>m.rid===f.rid)}
 const g=SORTS[f.key]||SORTS.date;return[...r].sort((a,b)=>{const x=g(a),y=g(b);return(x<y?-1:x>y?1:0)*f.dir})}
function tableBox(full){
 const f=tf(),all=tblItems(full),rows=all.slice(0,full?f.n:8),conn=prof().connected.length;
 const th=(k,l,r)=>`<th scope="col" aria-sort="${f.key===k?(f.dir>0?'ascending':'descending'):'none'}"><button type="button" data-act="sort" data-v="${k}" ${r?'style="justify-content:flex-end"':''}>${l}${f.key===k?ic('chev').replace('class="i "',`class="i" style="width:14px;height:14px;${f.dir>0?'transform:rotate(180deg)':''}"`):''}</button></th>`;
 const body=rows.map(m=>{const o=!!f.open[m.id];return`<tr class="r ${o?'open':''}" data-act="row" data-id="${m.id}"><td class="mono" style="font-size:.82rem;white-space:nowrap">${m.id}${m.demo?' <span class="chip mute">Sample</span>':''}</td><td>${genLabel(m)}</td><td>${CAT[m.cat].en}</td><td class="n">${m.wv!=null?nf(m.wv):`<span class="muted" title="Logged, not yet verified">${nf(m.wl)}*</span>`}</td><td>${REC[m.rid].name}</td><td style="white-space:nowrap">${fmtD(m.pickupAt)}</td><td>${sChip(m.status)}</td><td class="xp"><button type="button" data-act="row" data-id="${m.id}" aria-expanded="${o}" aria-label="Details for ${m.id}">${ic('chev')}</button></td></tr>${o?detailRow(m):''}`}).join('');
 const empty=!conn?`<div class="empty">${ic('truck')}<h3>No recyclers connected</h3><p class="muted">Manifests from your recycler network will list here.</p><button type="button" class="btn btn-primary" style="margin-top:12px" data-act="tab" data-v="recyclers">${t('connect')}</button></div>`:S.loading&&!all.length?`<div style="padding:16px;display:grid;gap:10px">${skel(3)}</div>`:`<div class="empty"><h3>No manifests match</h3><p class="muted">Change the filters or clear the search.</p></div>`;
 return`<div class="tblwrap"><table class="tbl"><caption class="sr">Recent manifests. Select a column heading to sort.</caption><thead><tr>${th('id','Manifest ID')}${th('gen','Generator')}${th('cat','Category')}${th('kg','Weight (kg)',1)}${th('rec','Recycler')}${th('date','Date')}${th('status','Status')}<th class="xp"><span class="sr">Expand</span></th></tr></thead><tbody>${body}</tbody></table>${rows.length?'':empty}</div>
 ${rows.length?`<p class="muted" style="font-size:.8rem;margin-top:8px">* Logged by the generator, not yet verified by the recycler. Showing ${rows.length} of ${all.length}.</p>`:''}${full&&all.length>rows.length?`<div style="text-align:center;margin-top:10px"><button type="button" class="btn btn-ghost" data-act="more">Show more</button></div>`:''}`}
function detailRow(m){
 const r=REC[m.rid],dl=m.wv!=null?m.wv-m.wl:null;
 return`<tr class="detail"><td colspan="8"><div class="dgrid"><div>${m.photo?`<img loading="lazy" alt="Photograph of the waste" src="${m.photo}">`:`<div style="width:140px;height:110px;border-radius:10px;background:var(--line);display:grid;place-items:center;color:var(--muted);text-align:center;font-size:.75rem;padding:8px">${cic(m.cat).replace('<svg','<svg style="width:36px;height:36px;stroke:currentColor;fill:none;stroke-width:2"')}<span>No photo in this sample record</span></div>`}</div>
 <dl><dt>Logged</dt><dd>${nf(m.wl)} kg</dd><dt>Verified</dt><dd>${m.wv!=null?nf(m.wv)+' kg'+(dl?` (${dl>=0?'+':''}${nf(dl)} kg, ${(dl/m.wl*100).toFixed(1)}%)`:''):'Pending'}</dd><dt>GPS</dt><dd class="mono">${m.lat.toFixed(5)}, ${m.lng.toFixed(5)}</dd><dt>Zone</dt><dd>${m.zone}</dd></dl>
 <div><dl style="margin-bottom:10px"><dt>Pickup</dt><dd>${fmtDT(m.pickupAt)}</dd><dt>Recycler confirmed</dt><dd>${m.deliveredAt?fmtDT(m.deliveredAt):'Not yet'}</dd><dt>Licence</dt><dd class="mono">${r.lic}</dd>${m.note?`<dt>Note</dt><dd>${esc(m.note)}</dd>`:''}</dl><div class="row wrap"><button type="button" class="btn btn-primary btn-sm" data-act="cpcb" data-id="${m.id}">${ic('pdf')}CPCB export</button><button type="button" class="btn btn-ghost btn-sm" data-act="open-m" data-id="${m.id}">${t('viewm')}</button></div></div></div></td></tr>`}
function cManifests(){
 const f=tf();
 return`<div class="row sp wrap" style="margin-bottom:14px"><div><h1 class="h1">Manifests</h1><p class="muted">Every handover from your connected recyclers.</p></div><button type="button" class="btn btn-amber" data-act="rep-open">${ic('pdf')}${t('genreport')}</button></div>
 <div class="toolbar"><div><label class="sr" for="tf-q">Search manifests</label><input id="tf-q" type="search" placeholder="Search ID, generator, recycler or zone" data-bind="ui.tf.q" value="${esc(f.q)}"></div>
 <div><label class="sr" for="tf-s">Status</label><select id="tf-s" data-bind="ui.tf.status"><option value="">All statuses</option>${['verified','pending','flagged'].map(s=>`<option value="${s}" ${f.status===s?'selected':''}>${t('status.'+s)}</option>`).join('')}</select></div>
 <div><label class="sr" for="tf-c">Category</label><select id="tf-c" data-bind="ui.tf.cat"><option value="">All categories</option>${CATS.map(c=>`<option value="${c.id}" ${f.cat===c.id?'selected':''}>${c.en}</option>`).join('')}</select></div>
 <div><label class="sr" for="tf-r">Recycler</label><select id="tf-r" data-bind="ui.tf.rid"><option value="">All recyclers</option>${Object.values(REC).map(r=>`<option value="${r.id}" ${f.rid===r.id?'selected':''}>${r.name}</option>`).join('')}</select></div></div><div id="tblbox">${tableBox(true)}</div>`}

function cRecyclers(){
 const p=prof(),Q=quarterOf(Date.now());
 return`<div style="margin-bottom:14px"><h1 class="h1">Recyclers</h1><p class="muted">CPCB-licensed partners. Connect a recycler to bring its verified handovers into your portfolio.</p></div>
 <div class="grid2">${Object.values(REC).map(r=>{const c=p.connected.includes(r.id),ms=getAll().filter(m=>m.rid===r.id&&m.pickupAt>=Q.start&&m.pickupAt<=Q.end),v=ms.filter(m=>m.status==='verified'),cf=ms.filter(m=>m.deliveredAt).sort((a,b)=>b.deliveredAt-a.deliveredAt)[0];
  return`<article class="card"><div class="row sp" style="align-items:flex-start"><div><h3 style="font-size:1.15rem">${r.name}</h3><p class="mono muted" style="font-size:.82rem;margin-top:2px">${r.lic}</p><p class="muted" style="font-size:.88rem;margin-top:2px">${ic('pin')}${r.base} · ${r.vehicle}</p></div>${c?`<span class="chip ok">${ic('check')}Connected</span>`:`<span class="chip mute">Not connected</span>`}</div>
  <div class="row" style="margin:14px 0;gap:20px"><div><div class="eyebrow">Verified kg</div><b class="num" style="font:800 1.4rem var(--font-head)">${nf(sum(v,m=>m.wv))}</b></div><div><div class="eyebrow">Pending</div><b class="num" style="font:800 1.4rem var(--font-head)">${ms.filter(m=>m.status==='pending').length}</b></div><div><div class="eyebrow">Flagged</div><b class="num" style="font:800 1.4rem var(--font-head)">${ms.filter(m=>m.status==='flagged').length}</b></div></div>
  <p class="muted" style="font-size:.82rem;margin-bottom:12px">${cf?'Last confirmation '+fmtDT(cf.deliveredAt):'No confirmations this quarter'}</p>
  <button type="button" class="btn ${c?'btn-ghost':'btn-primary'} btn-sm" data-act="rconn" data-id="${r.id}">${c?'Disconnect':ic('plus')+'Connect recycler'}</button></article>`}).join('')}</div>`}

function cReports(){
 const p=prof(),Q=quarterOf(Date.now());
 return`<div class="row sp wrap" style="margin-bottom:14px"><div><h1 class="h1">Reports</h1><p class="muted">CPCB-ready PDF reports built from your verified manifests.</p></div><button type="button" class="btn btn-amber" data-act="rep-open">${ic('pdf')}${t('genreport')}</button></div>
 <div class="card" style="margin-bottom:14px"><h3 style="margin-bottom:6px">${Q.label} is in progress</h3><p class="muted" style="margin-bottom:12px">Generate the current quarter, or pick any range, categories and recyclers in the report window.</p><button type="button" class="btn btn-primary btn-sm" data-act="rep-open">${ic('pdf')}Create ${Q.label} report</button></div>
 <h2 class="h2" style="margin-bottom:10px">Generated reports</h2>${S.reports.length?`<div class="tblwrap"><table class="tbl" style="min-width:640px"><thead><tr><th><span style="padding:0 12px;display:block;min-height:44px;line-height:44px">Reference</span></th><th><span style="padding:0 12px">Period</span></th><th><span style="padding:0 12px">Manifests</span></th><th><span style="padding:0 12px">Verified kg</span></th><th></th></tr></thead><tbody>${S.reports.map((r,i)=>`<tr><td class="mono">${r.ref}<br><span class="muted" style="font-size:.75rem">${fmtDT(r.at)}</span></td><td>${r.from} to ${r.to}</td><td class="n">${r.count}</td><td class="n">${nf(r.kg)}</td><td><button type="button" class="btn btn-ghost btn-sm" data-act="rep-again" data-i="${i}">${ic('pdf')}Download again</button></td></tr>`).join('')}</tbody></table></div>`:`<div class="card empty">${ic('doc')}<h3>No reports yet</h3><p class="muted">Your first report takes one click.</p></div>`}`}

function cSettings(){
 const p=prof();
 return`<div style="margin-bottom:14px"><h1 class="h1">Settings</h1></div><div class="grid2">
 <div class="card"><h3 style="margin-bottom:10px">Company</h3><dl style="margin:0;display:grid;grid-template-columns:auto 1fr;gap:6px 14px"><dt class="muted">Company</dt><dd style="margin:0;font-weight:600">${esc(p.company)}</dd><dt class="muted">${p.idType}</dt><dd class="mono" style="margin:0">${esc(p.idNo)}</dd><dt class="muted">Email</dt><dd style="margin:0;overflow-wrap:anywhere">${esc(p.email)}</dd></dl></div>
 <div class="card"><h3 style="margin-bottom:10px">Targets</h3><div class="field"><label for="st-t">Quarterly target (kg verified)</label><input id="st-t" type="number" min="1" step="10" data-bind="profiles.compliance.target" value="${p.target}"></div><div class="field" style="margin:0"><label for="st-k">Kg verified per EPR credit</label><input id="st-k" type="number" min=".1" step=".1" data-bind="profiles.compliance.kgPerCredit" value="${p.kgPerCredit}"></div></div>
 <div class="card"><h3 style="margin-bottom:4px">Privacy and data</h3><div class="switch"><span><b>Anonymise all generators</b><br><span class="muted" style="font-size:.85rem">Hide names even where the generator agreed to be named.</span></span><button type="button" role="switch" aria-checked="${!!p.anonymize}" aria-label="Anonymise all generators" data-act="set-anon"></button></div>
 <div class="switch"><span><b>Include sample data</b><br><span class="muted" style="font-size:.85rem">Example handovers so the dashboard is not empty. Turn off to see only real records.</span></span><button type="button" role="switch" aria-checked="${p.includeSample!==false}" aria-label="Include sample data" data-act="set-sample"></button></div></div>
 <div class="card"><h3 style="margin-bottom:10px">This device</h3><p class="muted" style="margin-bottom:12px;font-size:.9rem">Clears profiles, saved manifests and reports stored in this browser. Records already in the shared store stay there.</p><button type="button" class="btn ${S.ui.cr?'btn-primary':'btn-ghost'} btn-sm" style="${S.ui.cr?'background:var(--bad)':''}" data-act="reset-all">${S.ui.cr?'Tap again to clear everything':'Reset this device'}</button></div></div>`}

/* report modal */
function repDefaults(){const p=prof();return{from:ymd(quarterOf(Date.now()).start),to:ymd(Date.now()),cats:Object.fromEntries(CATS.map(c=>[c.id,true])),rids:Object.fromEntries(p.connected.map(r=>[r,true])),verOnly:true}}
function repRows(){
 const p=prof(),o=S.ui.rep,a=parseYmd(o.from),b=parseYmd(o.to,1);
 return getAll().filter(m=>p.connected.includes(m.rid)&&m.pickupAt>=a&&m.pickupAt<=b&&o.cats[m.cat]&&o.rids[m.rid]&&(!o.verOnly||m.status==='verified')).sort((x,y)=>x.pickupAt-y.pickupAt)}
function repPreview(){const r=repRows(),v=r.filter(m=>m.status==='verified');return`${r.length} manifests · ${nf(sum(v,m=>m.wv))} kg verified${r.length?'':'. Nothing matches these filters.'}`}
function reportModal(){
 if(S.ui.modal!=='report')return'';
 const p=prof(),o=S.ui.rep;
 if(!p.connected.length)return`<div class="overlay dim center" data-act="rep-close" role="dialog" aria-modal="true" aria-label="Generate Compliance Report"><div class="modal" data-stop><h2 class="h1" data-first tabindex="-1">${t('genreport')}</h2><p class="muted" style="margin:8px 0 16px">Connect at least one recycler first. Reports are built from their verified manifests.</p><div class="row"><button type="button" class="btn btn-primary" data-act="rep-conn">${t('connect')}</button><button type="button" class="btn btn-ghost" data-act="rep-close">${t('cancel')}</button></div></div></div>`;
 return`<div class="overlay dim center" data-act="rep-close" role="dialog" aria-modal="true" aria-label="Generate Compliance Report"><div class="modal" data-stop><div class="row sp" style="margin-bottom:14px"><h2 class="h1" data-first tabindex="-1">${t('genreport')}</h2><button type="button" class="btn btn-ghost btn-sm" data-act="rep-close" aria-label="Close">${ic('x')}</button></div>
 <div class="row wrap" style="margin-bottom:10px"><button type="button" class="btn btn-ghost btn-sm" data-act="rep-q" data-v="cur">This quarter</button><button type="button" class="btn btn-ghost btn-sm" data-act="rep-q" data-v="prev">Last quarter</button></div>
 <div class="filters" style="margin-bottom:14px"><div class="field" style="margin:0"><label for="r-f">From</label><input id="r-f" type="date" value="${o.from}" data-bind="ui.rep.from"></div><div class="field" style="margin:0"><label for="r-t">To</label><input id="r-t" type="date" value="${o.to}" data-bind="ui.rep.to"></div></div>
 <fieldset style="border:0;padding:0;margin:0 0 12px"><legend class="lbl">Categories</legend><div class="filters">${CATS.map(c=>`<label class="check"><input type="checkbox" ${o.cats[c.id]?'checked':''} data-bind="ui.rep.cats.${c.id}">${c.en}</label>`).join('')}</div></fieldset>
 <fieldset style="border:0;padding:0;margin:0 0 12px"><legend class="lbl">Recycler partners</legend>${p.connected.map(id=>`<label class="check"><input type="checkbox" ${o.rids[id]?'checked':''} data-bind="ui.rep.rids.${id}">${REC[id].name}</label>`).join('')}</fieldset>
 <label class="check" style="margin-bottom:12px"><input type="checkbox" ${o.verOnly?'checked':''} data-bind="ui.rep.verOnly">Verified manifests only (recommended for CPCB upload)</label>
 <p class="card flat" id="repprev" aria-live="polite" style="margin-bottom:14px;font-weight:600">${repPreview()}</p>
 <div class="row wrap"><button type="button" class="btn btn-amber grow" data-act="rep-go">${ic('pdf')}Download PDF</button><button type="button" class="btn btn-ghost" data-act="rep-close">${t('cancel')}</button></div></div></div>`}

/* ================= recycler desk ================= */
function rdState(){return S.ui.rd||(S.ui.rd={rid:'r1',q:'',open:null,flag:false,reason:'Weight differs',kg:0})}
function rdList(){
 const d=rdState(),q=d.q.trim().toLowerCase(),all=getAll().filter(m=>m.rid===d.rid);
 const pend=all.filter(m=>m.status==='pending'&&(!q||(m.id+' '+m.gname).toLowerCase().includes(q))).sort((a,b)=>a.pickupAt-b.pickupAt);
 const done=all.filter(m=>m.status!=='pending').sort((a,b)=>b.deliveredAt-a.deliveredAt).slice(0,4);
 const row=(m,act)=>`<button type="button" class="item" ${act?`data-act="rd-open" data-id="${m.id}"`:'disabled style="opacity:1;cursor:default"'}>${photoOrIcon(m)}<span class="grow"><span class="mono" style="font-weight:600;font-size:.85rem">${m.id}</span><br><span class="muted" style="font-size:.85rem">${CAT[m.cat].en} · ${nf(m.wl)} kg logged · ${fmtDT(m.pickupAt)}</span><br><span style="font-size:.85rem">${genLabel(m)}${m.demo?' <span class="chip mute">Sample</span>':''}</span></span>${act?`<span class="chip warn">${ic('clock')}Confirm</span>`:sChip(m.status)}</button>`;
 return`<h3 style="margin:4px 0 10px">Waiting for confirmation (${pend.length})</h3><div class="stack" style="gap:10px">${pend.length?pend.map(m=>row(m,1)).join(''):'<div class="card flat empty"><p class="muted">Nothing waiting. New handovers for this recycler appear here.</p></div>'}</div>${done.length?`<h3 style="margin:20px 0 10px">Recently confirmed</h3><div class="stack" style="gap:10px">${done.map(m=>row(m,0)).join('')}</div>`:''}`}
function viewRecycler(){
 const d=rdState(),m=d.open&&getM(d.open);
 let b;
 if(m){
  const r=REC[m.rid];
  const dl=d.kg-m.wl, pct=Math.abs(dl)/m.wl*100;
  const tolClass = pct<=10 ? 'ok' : pct<=15 ? 'warn' : 'bad';
  const tolText = pct<=10 ? '✓ Within 10% CPCB Tolerance (EPR Eligible)' : '⚠️ Exceeds 10% Limit — Discrepancy Flag Required';

  b=`<button type="button" class="btn btn-ghost btn-sm" style="margin-bottom:12px" data-act="rd-back">${ic('back')}${t('back')}</button>
  <div class="card"><div class="row" style="align-items:flex-start">${photoOrIcon(m,'thumb')}
   <div class="grow"><div class="mono" style="font-weight:700">${m.id}</div><div>${CAT[m.cat].en} · ${genLabel(m)}</div><div class="muted" style="font-size:.85rem">${m.zone} · picked up ${fmtDT(m.pickupAt)}</div></div>
  </div><hr><div class="row sp"><span class="muted">Logged by generator</span><b class="num">${nf(m.wl)} kg</b></div></div>

  <div class="card" style="margin-top:12px">
   <div class="scale-console" style="margin-bottom:16px">
    <div class="brand">⚖️ MPCB CERTIFIED INDUSTRIAL WEIGH SCALE</div>
    <div class="readout"><output id="rdkg" aria-live="polite">${nf(d.kg)}</output><span class="unit">KG</span></div>
    <div class="tolerance-pill ${tolClass}">
      ${ic(pct<=10?'check':'alert')} ${tolText} (${dl>=0?'+':''}${nf(dl)} kg, ${pct.toFixed(1)}%)
    </div>
   </div>

   <div class="row" style="justify-content:center;gap:8px;margin-bottom:14px">
    <button type="button" class="btn btn-ghost" style="min-width:54px" data-hold="-1" data-for="rd">−1 kg</button>
    <button type="button" class="btn btn-ghost" style="min-width:54px" data-hold="-0.1" data-for="rd">−0.1</button>
    <button type="button" class="btn btn-ghost" style="min-width:54px" data-hold="0.1" data-for="rd">+0.1</button>
    <button type="button" class="btn btn-ghost" style="min-width:54px" data-hold="1" data-for="rd">+1 kg</button>
   </div>

   ${d.flag?`<div class="field"><span class="lbl">Reason for flagging</span><div class="seg" role="radiogroup">${['Weight differs by >10%','Photo does not match','Wrong category','Damaged / Non-recyclable'].map(x=>`<button type="button" role="radio" aria-checked="${d.reason===x}" data-act="rd-reason" data-v="${x}">${x}</button>`).join('')}</div></div><div class="row wrap"><button type="button" class="btn btn-primary grow" style="background:var(--bad)" data-act="rd-flag-ok">${ic('x')}Flag Handover</button><button type="button" class="btn btn-ghost" data-act="rd-flag">${t('cancel')}</button></div>`
   :`<div class="row wrap"><button type="button" class="btn btn-primary grow" style="background:var(--ok-strong);min-height:54px;font-size:1.1rem" data-act="rd-ok">${ic('check')}Confirm Scale Weight & Payout</button><button type="button" class="btn btn-ghost" data-act="rd-flag">${ic('alert')}Flag Discrepancy</button></div>`}
  </div>
  <p class="muted" style="font-size:.82rem;margin-top:10px">${esc(r.name)} · ${r.lic}</p>`;
 }
 else b=`<div class="field"><label for="rd-r">Active Recycling Facility</label><select id="rd-r" data-bind="ui.rd.rid">${Object.values(REC).map(r=>`<option value="${r.id}" ${d.rid===r.id?'selected':''}>${r.name} (${r.base})</option>`).join('')}</select></div><div class="field"><label for="rd-q">Scan or Search Handover Manifest</label><input id="rd-q" type="search" placeholder="Search AKR-XXXX or Generator..." data-bind="ui.rd.q" value="${esc(d.q)}"></div><div id="rdlist">${rdList()}</div>`;

 return`<header class="appbar"><div class="gut"><div class="col"><div><div class="sub">Recycler Facility Desk</div><h1>Confirm Handovers & Scale Weighing</h1></div>${langBar()}</div></div></header>`+col(`<main class="page">${b}</main>`);
}
function rdDelta(m){const d=rdState(),dl=d.kg-m.wl,p=Math.abs(dl)/m.wl*100;return`${dl>=0?'+':''}${nf(dl)} kg (${(dl/m.wl*100).toFixed(1)}%) against logged weight${p>10?' · will be flagged':''}`}
function rdAdj(dv){const d=rdState(),m=getM(d.open);if(!m)return;d.kg=Math.max(.1,Math.round((d.kg+dv)*10)/10);const a=$('#rdkg'),b=$('#rdd');if(a)a.textContent=nf(d.kg);if(b)b.textContent=rdDelta(m)}

/* ================= actions ================= */
function setPath(path,val){const k=path.split('.');let o=S;for(let i=0;i<k.length-1;i++){if(o[k[i]]==null||typeof o[k[i]]!=='object')o[k[i]]={};o=o[k[i]]}o[k[k.length-1]]=val}
function tblRefresh(){const b=$('#tblbox');if(b)b.innerHTML=tableBox(S.tab.compliance==='manifests')}
function copyText(txt,msg){
 const fallback=()=>toast(msg?msg+' ':'Copy this: '+txt);
 try{if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(txt).then(()=>toast(msg||'Copied.'),fallback);return}}catch(e){}
 fallback()}
function addSampleHistory(){
 const p=prof(),now=Date.now(),cs=p.role==='shop'?['board','phone','laptop','board']:['phone','wire','mixed','battery','phone','laptop'];
 for(let i=1;i<=6;i++){
  const cat=cs[i%cs.length],wl=Math.round((4+Math.random()*(p.role==='shop'?10:22))*2)/2,when=sod(now-i*DAY*(p.role==='shop'?4:1))+10*36e5,wv=Math.round(wl*(.95+Math.random()*.05)*10)/10;
  const z=p.zone,c=ZONES[z],rid=ZREC[z];
  const m={id:mkId(),gid:p.id,gname:p.role==='shop'?p.shopName:(p.name||'Kabadiwala ••'+p.phone.slice(-4)),gcode:'G-'+p.id.slice(-4).toUpperCase(),role:p.role,named:p.role==='shop'?p.named!==false:false,zone:z,cat,wl,wv,paid:Math.round(wv*CAT[cat].rate),rid,pickupAt:when,deliveredAt:when+3*36e5,status:'verified',lat:+(c[0]+(Math.random()-.5)*.008).toFixed(5),lng:+(c[1]+(Math.random()-.5)*.008).toFixed(5),photo:null,photoSample:false,note:'',demo:true,u:Date.now()};
  S.notified[m.id+':verified']=1;putM(m)}
 render()}

const ACT={
 'role-menu'(){ S.ui.roleMenu = true; S.ui.fo = true; render(); },
 'role-menu-close'(el,e){ if(el.classList.contains('overlay')&&e.target.closest('[data-stop]'))return; S.ui.roleMenu = false; render(); },
 'role-pick'(el){
   const r = el.dataset.v;
   S.ui.roleMenu = false;
   if(r === 'recdesk'){
     S.view = 'recycler';
     S.pub = null;
     S.ui.rd = null;
   } else {
     S.role = r;
     S.view = 'app';
     if(!S.profiles[r] && DEFAULT_PROFILES[r]) {
       S.profiles[r] = { ...DEFAULT_PROFILES[r] };
     }
     persist();
   }
   render();
   window.scrollTo(0, 0);
 },
 'toggle-frame'(){
   S.ui.wideMode = !S.ui.wideMode;
   render();
 },
 'start-onboard'(){
   S.ob = { role: 'kabadi', step: 0, d: { zone: 'Dharavi' } };
   S.view = 'onboard';
   S.ui.fo = true;
   render();
   window.scrollTo(0, 0);
 },

 'role-switch'(el){
   const r=el.value;
   if(!r){S.view='select';render();return}
   if(r==='recdesk'){ACT.recdesk();return}
   if(S.profiles[r]){S.role=r;S.view='app';persist()}
   else{S.ob={role:r,step:0,d:{zone:r==='shop'?'Grant Road':'Dharavi'}};S.view='onboard';S.ui.fo=true}
   render();scrollTo(0,0)
 },
 'pwa-install'(){
   if(window.deferredPwaPrompt){
     window.deferredPwaPrompt.prompt();
     window.deferredPwaPrompt.userChoice.then(()=>{
       window.deferredPwaPrompt=null;
       render();
     });
   }
 },
 'about-open'(){S.ui.about=true;S.ui.fo=true;render()},
 'about-close'(el,e){if(el.classList.contains('overlay')&&e.target.closest('[data-stop]'))return;S.ui.about=false;render()},
 lang(el){S.lang=el.dataset.v;persist();document.documentElement.lang=S.lang;render()},
 offline(){S.offline=!S.offline;S.ui.wasOffline=true;if(!S.offline)trySync();render()},
 home(){S.view='select';S.pub=null;S.ui.rd=null;S.ob=null;if(location.hash){try{history.replaceState(null,'',location.pathname+location.search)}catch(e){location.hash=''}}render();scrollTo(0,0)},
 recdesk(){S.view='recycler';S.pub=null;S.ui.rd=null;render();scrollTo(0,0)},
 pick(el){const r=el.dataset.v;if(S.profiles[r]){S.role=r;S.view='app';persist()}else{S.ob={role:r,step:0,d:{zone:r==='shop'?'Grant Road':'Dharavi'}};S.view='onboard';S.ui.fo=true}render();scrollTo(0,0)},
 'ob-next':obNext,
 'ob-back'(){if(S.ob.step>0){S.ob.step--;render()}else{S.view='select';S.ob=null;render()}},
 'ob-sample'(){S.ob.d.photo=samplePhoto();render()},
 'ob-zone'(el){S.ob.d.zone=el.dataset.v;render()},
 tab(el){S.tab[S.role]=el.dataset.v;S.ui.sheet=false;render();scrollTo(0,0)},
 support(){S.ui.sheet=true;S.ui.fo=true;render()},
 'sheet-close'(el,e){if(el.classList.contains('overlay')&&e.target.closest('[data-stop]'))return;S.ui.sheet=false;render()},
 'copy-no'(){copyText(SUPPORT_NO,'Number copied.')},
 /* kabadiwala */
 log(){S.ui.log={step:1,photo:null,cat:null,kg:5,sample:false};S.ui.fo=true;render()},
 'log-back'(){const L=S.ui.log;if(L.step>1)L.step--;else S.ui.log=null;render()},
 'log-sample'(){const L=S.ui.log;L.photo=samplePhoto();L.sample=true;L.step=2;render()},
 cat(el){const L=S.ui.log;L.cat=el.dataset.v;L.step=3;render()},
 'log-ok'(){const L=S.ui.log;if(isOffline())S.ui.wasOffline=true;const m=newManifest({cat:L.cat,wl:L.kg,photo:L.photo,photoSample:L.sample});S.ui.log=null;S.ui.success=m.id;S.ui.fo=true;render()},
 'success-done'(){S.ui.success=null;S.tab.kabadi='home';render();scrollTo(0,0)},
 'sample-load'(){addSampleHistory()},
 'open-m'(el){const id=el.dataset.id;go(()=>{S.ui.success=null;S.ui.manifest=id;S.ui.fo=true})},
 'm-close'(){go(()=>{S.ui.manifest=null})},
 'm-pdf'(el){const m=getM(el.dataset.id);if(m)pdfManifest(m)},
 'm-copy'(el){copyText(mLink(el.dataset.id),'Link copied.')},
 'cpcb'(el){const m=getM(el.dataset.id);if(m)pdfManifest(m,true)},
 'pub-close'(){S.pub=null;try{history.replaceState(null,'',location.pathname+location.search)}catch(e){location.hash=''}render()},
 'aad-open'(){S.ui.aad=true;render()},
 'aad-save'(){const v=(S.ui.aadv||'').replace(/\s/g,'');if(!/^\d{12}$/.test(v)){const e=$('#err');if(e)e.textContent='Enter all 12 digits.';return}prof().aadhaarLast4=v.slice(-4);S.ui.aad=false;S.ui.aadv='';persist();toast('Aadhaar linked. Bank transfer payments are unlocked.');render()},
 /* shop */
 'pu-open'(){S.ui.pu={cat:'board',kg:10,date:ymd(Date.now()+DAY),notes:'',photo:null};S.ui.fo=true;render()},
 'pu-cat'(el){S.ui.pu.cat=el.dataset.v;render()},
 'pu-go':puGo,
 'pu-close'(){S.ui.pu=null;render()},
 'hist-pdf'(){pdfHistory(prof(),histRows(),histDesc())},
 'badge-share'(){const p=prof();copyText(`${p.shopName} is a Green Shop: e-waste handovers verified through Akrit.`,'Share text copied.');badgePng()},
 'gst-save'(){const v=(S.ui.gst||'').toUpperCase().trim(),e=$('#err');if(!/^\d{2}[A-Z]{5}\d{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/.test(v)){if(e)e.textContent='That GST number does not look right. It has 15 characters.';return}prof().gst=v;S.ui.gst='';persist();toast('GST number added.');render()},
 named(){const p=prof();p.named=p.named===false;persist();render()},
 /* compliance */
 sort(el){const f=tf(),k=el.dataset.v;if(f.key===k)f.dir*=-1;else{f.key=k;f.dir=k==='date'?-1:1}tblRefresh()},
 row(el,e){if(e.target.closest('button')&&e.target!==el&&!e.target.closest('[data-act="row"]'))return;const f=tf(),id=el.dataset.id;f.open[id]=!f.open[id];tblRefresh()},
 more(){tf().n+=12;tblRefresh()},
 'rep-open'(){S.ui.rep=repDefaults();S.ui.modal='report';S.ui.fo=true;render()},
 'rep-close'(el,e){if(el.classList.contains('overlay')&&e.target.closest('[data-stop]'))return;S.ui.modal=null;render()},
 'rep-conn'(){S.ui.modal=null;S.tab.compliance='recyclers';render()},
 'rep-q'(el){const Q=quarterOf(Date.now()),q=el.dataset.v==='cur'?Q:quarterOf(Q.start-DAY);S.ui.rep.from=ymd(q.start);S.ui.rep.to=ymd(Math.min(q.end,Date.now()));render()},
 async 'rep-go'(el){const o=S.ui.rep,rows=repRows();if(!rows.length){toast('Nothing matches these filters.');return}
  el.disabled=true;const p=prof(),res=await pdfReport(p,o,rows);el.disabled=false;
  if(res&&res.ok){S.reports.unshift({ref:res.ref,at:Date.now(),from:o.from,to:o.to,kg:res.kg,count:rows.length,o:JSON.parse(JSON.stringify(o))});persist();push(`Your ${quarterOf(parseYmd(o.to)).label} EPR report is ready to download. ${nf(res.kg)}kg verified in this report.`);S.ui.modal=null;render()}},
 'rep-again'(el){const r=S.reports[+el.dataset.i];if(!r)return;S.ui.rep=r.o;const rows=repRows();pdfReport(prof(),r.o,rows)},
 rconn(el){const p=prof(),id=el.dataset.id,i=p.connected.indexOf(id);if(i<0){p.connected.push(id);toast(REC[id].name+' connected. Its verified handovers now appear in your portfolio.')}else p.connected.splice(i,1);persist();render()},
 'set-anon'(){const p=prof();p.anonymize=!p.anonymize;persist();render()},
 'set-sample'(){const p=prof();p.includeSample=p.includeSample===false;bump();persist();render()},
 'reset-all'(){if(!S.ui.cr){S.ui.cr=true;render();return}try{localStorage.removeItem(LS);localStorage.removeItem('akrit.cache')}catch(e){}
  Object.assign(S,{profiles:{},role:null,reports:[],queue:[],notified:{},local:{m:{},p:{}},view:'select',ui:{}});bump();render()},
 /* recycler */
 'rd-open'(el){const d=rdState(),m=getM(el.dataset.id);d.open=el.dataset.id;d.kg=m?m.wl:0;d.flag=false;render();scrollTo(0,0)},
 'rd-back'(){rdState().open=null;render()},
 'rd-flag'(){const d=rdState();d.flag=!d.flag;render()},
 'rd-reason'(el){rdState().reason=el.dataset.v;render()},
 'rd-ok'(){const d=rdState(),m=getM(d.open);if(!m)return;const n=verifyM(m,d.kg);d.open=null;toast(n.status==='verified'?`Handover ${n.id} confirmed at ${nf(n.wv)} kg.`:`Handover ${n.id} flagged: ${n.note}.`);render();scrollTo(0,0)},
 'rd-flag-ok'(){const d=rdState(),m=getM(d.open);if(!m)return;const n=verifyM(m,d.kg,d.reason);d.open=null;toast(`Handover ${n.id} flagged: ${d.reason}.`);render();scrollTo(0,0)}
};
app.addEventListener('click',e=>{
 const h=e.target.closest('[data-hold]');
 if(h){const fn=h.dataset.for==='rd'?rdAdj:logAdj;if(h.dataset.did){delete h.dataset.did;return}fn(+h.dataset.hold);return}
 const el=e.target.closest('[data-act]');if(!el)return;
 const f=ACT[el.dataset.act];if(f)f(el,e)});
let holdT=null,holdI=null;
const stopHold=()=>{clearTimeout(holdT);clearInterval(holdI);holdT=holdI=null};
app.addEventListener('pointerdown',e=>{const b=e.target.closest('[data-hold]');if(!b)return;const dv=+b.dataset.hold,fn=b.dataset.for==='rd'?rdAdj:logAdj;fn(dv);b.dataset.did='1';holdT=setTimeout(()=>{holdI=setInterval(()=>fn(dv),110)},450)});
['pointerup','pointercancel','pointerleave'].forEach(ev=>app.addEventListener(ev,stopHold,true));document.addEventListener('pointerup',stopHold);
app.addEventListener('change',e=>{
 const el=e.target.closest('select[data-act]');
 if(el&&ACT[el.dataset.act])ACT[el.dataset.act](el,e);
});
app.addEventListener('input',e=>{
 const el=e.target,p=el.dataset&&el.dataset.bind;if(!p)return;
 let v=el.type==='checkbox'?el.checked:el.type==='range'?+el.value:el.type==='number'?(el.value===''?NaN:+el.value):el.value;
 if(el.type==='number'&&isNaN(v))return;
 setPath(p,v);
 if(el.dataset.out){const o=$(el.dataset.out);if(o)o.textContent=el.value}
 if(p.startsWith('ui.hf')){const b=$('#hbox');if(b)b.innerHTML=histInner()}
 else if(p.startsWith('ui.tf')){tf().n=12;tblRefresh()}
 else if(p.startsWith('ui.rep')){const b=$('#repprev');if(b)b.textContent=repPreview()}
 else if(p==='ui.rd.q'){const b=$('#rdlist');if(b)b.innerHTML=rdList()}
 else if(p==='ui.rd.rid'){rdState().q='';render()}
 else if(p.startsWith('profiles.')){persist();bump()}});
app.addEventListener('change',async e=>{
 const el=e.target;if(!el.matches||!el.matches('input[data-photo]'))return;
 const f=el.files&&el.files[0];if(!f)return;
 try{const url=await readImg(f);const path=el.dataset.photo;setPath(path+'.photo',url);setPath(path+'.sample',false);if(path==='ui.log')S.ui.log.step=2;render()}
 catch(x){toast('That photo could not be read. Try another one.')}});
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeTop()});

/* ================= boot ================= */
function readHash(){const m=(location.hash||'').match(/^#m-(AKR-[A-Za-z0-9-]+)$/);S.pub=m?m[1]:null}
window.addEventListener('hashchange',()=>{readHash();render()});
window.addEventListener('online',()=>{trySync();render()});
window.addEventListener('offline',()=>{S.ui.wasOffline=true;render()});
restore();cacheLoad();SAMPLE=buildSample();
document.documentElement.lang=S.lang;
S.view=(S.role&&S.profiles[S.role])?'app':'select';
readHash();render();initDb();
setTimeout(()=>{checkNotifs()},600);
