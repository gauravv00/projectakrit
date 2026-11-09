'use strict';
/* ================= helpers ================= */
const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const DAY=864e5, pad=n=>String(n).padStart(2,'0');
const fmtD=ts=>new Date(ts).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'});
const fmtDT=ts=>new Date(ts).toLocaleString('en-IN',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit',hour12:false});
const inr=n=>'₹'+Math.round(n).toLocaleString('en-IN');
const nf=n=>(Math.round(n*10)/10).toLocaleString('en-IN',{maximumFractionDigits:1});
const ymd=ts=>{const d=new Date(ts);return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate())};
const sod=ts=>{const d=new Date(ts);d.setHours(0,0,0,0);return d.getTime()};
const parseYmd=(s,end)=>{const [y,m,d]=s.split('-').map(Number);return new Date(y,m-1,d,end?23:0,end?59:0,end?59:0).getTime()};
const sum=(a,f)=>a.reduce((x,y)=>x+(f?f(y):y),0);
const rid4=()=>Math.random().toString(36).slice(2,6);

/* ================= i18n ================= */
const LANGS=[['en','EN'],['hi','हिं'],['mr','मरा']];
const T={
 continue:['Continue','आगे बढ़ें','पुढे जा'],back:['Back','वापस','मागे'],next:['Next','आगे','पुढे'],done:['Done','हो गया','झाले'],cancel:['Cancel','रद्द करें','रद्द करा'],
 save:['Save','सहेजें','जतन करा'],confirm:['Confirm','पक्का करें','निश्चित करा'],language:['Language','भाषा','भाषा'],
 call:['Call Support','सहायता को कॉल करें','मदतीला कॉल करा'],
 offline:['Offline. Your data will sync when connected.','ऑफ़लाइन। नेटवर्क आते ही आपका डेटा सिंक हो जाएगा।','ऑफलाइन. नेटवर्क मिळताच तुमचा डेटा सिंक होईल.'],
 home:['Home','होम','होम'],coll:['My Collections','मेरा कलेक्शन','माझे संकलन'],earn:['Earnings','कमाई','कमाई'],hist:['Waste History','कचरा इतिहास','कचरा इतिहास'],badge:['Green Shop','ग्रीन शॉप','ग्रीन शॉप'],
 'role.q':['What best describes you?','आप क्या करते हैं?','तुम्ही काय करता?'],
 'role.k':['Kabadiwala','कबाड़ीवाला','भंगारवाला'],'role.k.d':['I collect and sell scrap.','मैं कबाड़ इकट्ठा करके बेचता हूँ।','मी भंगार गोळा करून विकतो.'],
 'role.s':['Repair Shop','रिपेयर शॉप','रिपेअर शॉप'],'role.s.d':['I repair electronics and have leftover parts.','मैं इलेक्ट्रॉनिक्स रिपेयर करता हूँ और मेरे पास बचे पुर्ज़े हैं।','मी इलेक्ट्रॉनिक्स दुरुस्त करतो आणि माझ्याकडे उरलेले भाग आहेत.'],
 'role.c':['Compliance Officer','कंप्लायंस अधिकारी','अनुपालन अधिकारी'],'role.c.d':['I manage recycling targets for my company.','मैं अपनी कंपनी के रीसाइक्लिंग लक्ष्य संभालता हूँ।','मी माझ्या कंपनीची रीसायकलिंग उद्दिष्टे सांभाळतो.'],
 resume:['Open','खोलें','उघडा'],
 phone:['Mobile number','मोबाइल नंबर','मोबाइल नंबर'],sendotp:['Send OTP','OTP भेजें','OTP पाठवा'],otp:['Enter the 6-digit OTP','6 अंकों का OTP डालें','6 अंकी OTP टाका'],verify:['Verify','जाँचें','तपासा'],
 selfie:['Take a photo of your face','अपने चेहरे की फ़ोटो लें','तुमच्या चेहऱ्याचा फोटो काढा'],area:['Where do you collect?','आप कहाँ से कबाड़ लेते हैं?','तुम्ही कुठे भंगार गोळा करता?'],
 name_opt:['Your name (optional)','आपका नाम (वैकल्पिक)','तुमचे नाव (ऐच्छिक)'],finish:['Start','शुरू करें','सुरू करा'],
 hello:['Namaste','नमस्ते','नमस्कार'],
 logcta:["Log Today's Collection",'आज का कलेक्शन दर्ज करें','आजचे संकलन नोंदवा'],logsub:['Photo, category, weight','फ़ोटो, किस्म, वज़न','फोटो, प्रकार, वजन'],
 today:["Today's earnings",'आज की कमाई','आजची कमाई'],week:['Handovers this week','इस हफ़्ते के हैंडओवर','या आठवड्यातील हस्तांतरण'],
 extra:['You earned extra today','आज आपने ज़्यादा कमाया','आज तुम्ही जास्त कमावले'],middle:['Middleman would pay','बिचौलिया देता','मध्यस्थ देईल'],youget:['You get','आपको मिला','तुम्हाला मिळाले'],
 step1:['Photograph the waste','कबाड़ की फ़ोटो लें','भंगाराचा फोटो काढा'],step2:['What did you collect?','क्या इकट्ठा किया?','काय गोळा केले?'],step3:['How much does it weigh?','वज़न कितना है?','वजन किती आहे?'],
 tapcam:['Tap to open camera','कैमरा खोलने के लिए दबाएँ','कॅमेरा उघडण्यासाठी दाबा'],samplephoto:['No camera? Use a sample photo','कैमरा नहीं है? सैंपल फ़ोटो लें','कॅमेरा नाही? नमुना फोटो वापरा'],
 expect:['You will earn about','आपको लगभग मिलेंगे','तुम्हाला सुमारे मिळतील'],
 saved:['Collection saved','कलेक्शन दर्ज हो गया','संकलन नोंदवले'],savedoff:['Saved on this phone','इस फ़ोन में सहेजा गया','या फोनमध्ये जतन केले'],
 code:['Handover code','हैंडओवर कोड','हस्तांतरण कोड'],sendcode:['Send this code to the recycler','यह कोड रीसाइकलर को भेजें','हा कोड रीसायकलरला पाठवा'],
 wa:['Share on WhatsApp','WhatsApp पर भेजें','WhatsApp वर पाठवा'],viewm:['Open manifest','मैनिफ़ेस्ट खोलें','मॅनिफेस्ट उघडा'],
 waiting:['waiting for recycler','रीसाइकलर की पुष्टि बाकी','रीसायकलरची पुष्टी बाकी'],confirmed:['confirmed','पक्का हुआ','निश्चित'],
 none_coll:['No collections yet','अभी कोई कलेक्शन नहीं','अजून संकलन नाही'],none_sub:['Tap the big button on Home to log your first one.','पहला दर्ज करने के लिए होम पर बड़ा बटन दबाएँ।','पहिले नोंदवण्यासाठी होमवरील मोठे बटण दाबा.'],
 sample_load:['Load sample history','सैंपल इतिहास जोड़ें','नमुना इतिहास जोडा'],
 aadhaar:['Link Aadhaar to unlock bank transfer payments','बैंक ट्रांसफ़र पाने के लिए आधार जोड़ें','बँक ट्रान्सफरसाठी आधार जोडा'],
 aadhaar_btn:['Link Aadhaar (optional)','आधार जोड़ें (वैकल्पिक)','आधार जोडा (ऐच्छिक)'],
 s_verifying:['Your Green Shop badge is being verified','आपका ग्रीन शॉप बैज जाँचा जा रहा है','तुमचा ग्रीन शॉप बॅज तपासला जात आहे'],
 s_prog:['{n} of 5 verifications complete','5 में से {n} जाँच पूरी','5 पैकी {n} तपासण्या पूर्ण'],s_active:['Green Shop badge active','ग्रीन शॉप बैज चालू है','ग्रीन शॉप बॅज सक्रिय'],
 month:['This month','इस महीने','या महिन्यात'],kglogged:['kg logged','किलो दर्ज','किलो नोंद'],earned:['Amount earned','कमाई की रकम','मिळालेली रक्कम'],rates:['Current rate per kg','प्रति किलो मौजूदा दर','प्रति किलो सध्याचा दर'],
 sched:['Schedule Pickup','पिकअप तय करें','पिकअप ठरवा'],sched_sub:['Choose waste, weight and date','कचरा, वज़न और तारीख़ चुनें','कचरा, वजन आणि तारीख निवडा'],
 category:['Waste category','कचरे की किस्म','कचऱ्याचा प्रकार'],estkg:['Estimated weight','अनुमानित वज़न','अंदाजे वजन'],pdate:['Preferred pickup date','पसंदीदा पिकअप तारीख़','पसंतीची पिकअप तारीख'],notes:['Notes','टिप्पणी','टीप'],
 submit:['Confirm pickup','पिकअप पक्का करें','पिकअप निश्चित करा'],
 export:['Export PDF','PDF निकालें','PDF काढा'],
 'status.verified':['Verified','सत्यापित','सत्यापित'],'status.pending':['Pending','बाकी','प्रलंबित'],'status.flagged':['Flagged','जाँच में','तपासणीत'],
 ov:['Overview','ओवरव्यू','आढावा'],mf:['Manifests','मैनिफ़ेस्ट','मॅनिफेस्ट'],rc:['Recyclers','रीसाइकलर','रीसायकलर'],rp:['Reports','रिपोर्ट','अहवाल'],st:['Settings','सेटिंग्स','सेटिंग्ज'],
 genreport:['Generate Compliance Report','कंप्लायंस रिपोर्ट बनाएँ','अनुपालन अहवाल तयार करा'],
 connect:['Connect your recycler network','अपना रीसाइकलर नेटवर्क जोड़ें','तुमचे रीसायकलर नेटवर्क जोडा']
};
function t(k,p){const a=T[k];let s=a?(a[LANGS.findIndex(l=>l[0]===S.lang)]||a[0]):k;if(p)for(const x in p)s=s.replace('{'+x+'}',p[x]);return s}

/* ================= icons ================= */
const IC={
 camera:'<path d="M4 8h3l1.5-2h7L17 8h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z"/><circle cx="12" cy="13" r="3.5"/>',
 call:'<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/>',
 home:'<path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/>',
 list:'<path d="M8 6h13M8 12h13M8 18h13"/><circle cx="3.5" cy="6" r="1"/><circle cx="3.5" cy="12" r="1"/><circle cx="3.5" cy="18" r="1"/>',
 rupee:'<path d="M7 5h11M7 10h11M7 5c6 0 8 2 8 5s-3 5-8 5l7 5"/>',
 check:'<path d="M5 12.5l4.5 4.5L19 7.5"/>',x:'<path d="M6 6l12 12M18 6L6 18"/>',clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
 share:'<circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="6" r="2.5"/><circle cx="18" cy="18" r="2.5"/><path d="M8.2 10.8l7.6-3.6M8.2 13.2l7.6 3.6"/>',
 link:'<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
 pdf:'<path d="M6 3h8l5 5v13H6z"/><path d="M14 3v5h5"/><path d="M12 11v6M9.5 14.5L12 17l2.5-2.5"/>',
 shield:'<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M8.5 12l2.5 2.5L15.5 10"/>',
 pin:'<path d="M12 21s7-6.2 7-11a7 7 0 0 0-14 0c0 4.8 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/>',
 truck:'<path d="M2 6h11v10H2zM13 9h4l3 3v4h-7z"/><circle cx="6.5" cy="17.5" r="1.8"/><circle cx="16.5" cy="17.5" r="1.8"/>',
 award:'<circle cx="12" cy="9" r="6"/><path d="M8.5 14L7 21l5-3 5 3-1.5-7"/><path d="M9.5 9l1.8 1.8L14.5 7.5"/>',
 back:'<path d="M15 5l-7 7 7 7"/>',plus:'<path d="M12 5v14M5 12h14"/>',minus:'<path d="M5 12h14"/>',chev:'<path d="M6 9l6 6 6-6"/>',
 wifioff:'<path d="M3 3l18 18M8.5 16.5a5 5 0 0 1 7 0M5 12.5a10 10 0 0 1 4-2.3M19 12.5a10 10 0 0 0-5.5-3M2 8.8a15 15 0 0 1 5-2.9M22 8.8a15 15 0 0 0-8.5-3.7"/>',
 user:'<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7"/>',
 settings:'<path d="M4 7h10M18 7h2M4 17h2M10 17h10"/><circle cx="16" cy="7" r="2"/><circle cx="8" cy="17" r="2"/>',
 chart:'<path d="M4 20V10M10 20V4M16 20v-8M22 20H2"/>',
 search:'<circle cx="11" cy="11" r="6.5"/><path d="M16 16l5 5"/>',cal:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
 upload:'<path d="M12 16V4M7 9l5-5 5 5M4 20h16"/>',building:'<path d="M4 21V5l8-2v18M12 8h8v13M4 21h17M7 9h2M7 13h2M7 17h2M15 12h2M15 16h2"/>',
 copy:'<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/>',
 wa:'<path d="M3 21l1.6-4.8A9 9 0 1 1 8 19.5z"/><path d="M9 8.5c0 3.5 3 6.5 6.5 6.5l1.3-1.6-2-1-1 .8a4 4 0 0 1-2-2l.8-1-1-2z"/>',
 alert:'<path d="M12 3l10 18H2z"/><path d="M12 10v5M12 18.5v.5"/>',
 doc:'<path d="M6 3h9l4 4v14H6z"/><path d="M9 12h7M9 16h7M9 8h3"/>',
 globe:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/>',
 mark:'<path d="M5 19L12 5l7 14"/><path d="M8.2 14h7.6"/>',
 refresh:'<path d="M20 11a8 8 0 0 0-14-4M4 5v4h4M4 13a8 8 0 0 0 14 4M20 19v-4h-4"/>'
};
const ic=(n,cls='')=>`<svg class="i ${cls}" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${IC[n]||''}</svg>`;
const CIC={
 phone:'<rect x="14" y="4" width="20" height="40" rx="4"/><path d="M21 38h6M20 9h8"/>',
 laptop:'<rect x="9" y="10" width="30" height="21" rx="2"/><path d="M4 36h40l-3 5H7z"/>',
 wire:'<path d="M9 40c-5-9 5-11 9-15s0-12 8-12 6 7 11 7"/><rect x="34" y="14" width="9" height="12" rx="2" transform="rotate(20 38 20)"/><path d="M6 40l5-3"/>',
 battery:'<rect x="8" y="15" width="29" height="19" rx="3"/><path d="M37 21h3v7h-3M21 19l-4 6h6l-4 6"/>',
 board:'<rect x="8" y="8" width="32" height="32" rx="3"/><rect x="18" y="18" width="12" height="12" rx="1"/><path d="M13 14h6v-3M35 14h-5v-3M13 34h6M35 34h-5M24 18v-5M24 30v5"/>',
 mixed:'<path d="M24 6l16 8v20l-16 8-16-8V14z"/><path d="M8 14l16 8 16-8M24 22v20"/>'
};
const cic=id=>`<svg viewBox="0 0 48 48" aria-hidden="true" focusable="false">${CIC[id]||''}</svg>`;

/* ================= domain data ================= */
const CATS=[
 {id:'phone',en:'Phones',hi:'फ़ोन',mr:'फोन',rate:40},
 {id:'laptop',en:'Laptops',hi:'लैपटॉप',mr:'लॅपटॉप',rate:32},
 {id:'wire',en:'Wires',hi:'तार',mr:'तार',rate:22},
 {id:'battery',en:'Batteries',hi:'बैटरी',mr:'बॅटरी',rate:28},
 {id:'board',en:'Boards',hi:'बोर्ड',mr:'बोर्ड',rate:85},
 {id:'mixed',en:'Mixed',hi:'मिक्स',mr:'मिक्स',rate:18}];
const CAT=Object.fromEntries(CATS.map(c=>[c.id,c]));
const catWord=c=>S.lang==='mr'?CAT[c].mr:CAT[c].hi;
const MIDDLE=.62; // what a middleman typically pays, as a share of the EPR rate (sample assumption)
const ZONES={Dharavi:[19.0430,72.8530],Kurla:[19.0726,72.8795],Andheri:[19.1197,72.8468],'Grant Road':[18.9646,72.8140],'Navi Mumbai':[19.0330,73.0297],Thane:[19.2183,72.9781],Vasai:[19.3919,72.8397]};
const REC={
 r1:{id:'r1',name:'Eco-Recycling Ltd (Ecoreco)',lic:'MPCB/RO(HQ)/E-Waste/2024-R0072',base:'Vasai East (7,200 MT)',vehicle:'Tempo (Tata Ace)'},
 r2:{id:'r2',name:'Evergreen Recyclekaro India',lic:'MPCB/RO(HQ)/E-Waste/2023-R0147',base:'Wada, Palghar (R2 & ISO)',vehicle:'Tempo (Tata Ace)'},
 r3:{id:'r3',name:'Justdispose Recycling Pvt Ltd',lic:'MPCB/RO(HQ)/E-Waste/2024-R0120',base:'Vasai East (1,200 MT)',vehicle:'Pickup van (Mahindra Bolero)'},
 r4:{id:'r4',name:'E-Incarnation Recycling',lic:'MPCB/RO(HQ)/E-Waste/2024-R0095',base:'Tarapur, Palghar (950 MT)',vehicle:'Heavy Tempo'}};
const ZREC={Dharavi:'r1',Kurla:'r3',Andheri:'r2','Grant Road':'r2','Navi Mumbai':'r2',Thane:'r2',Vasai:'r1'};
const FREE_MAIL=/@(gmail|yahoo|ymail|outlook|hotmail|live|rediffmail|proton|protonmail|icloud|aol)\./i;
const SUPPORT_NO='1800 000 0000';

/* quarter in the Indian financial year (Apr–Mar) */
function quarterOf(ts){const d=new Date(ts),m=d.getMonth(),y=d.getFullYear();const fy=m>=3?y:y-1;const q=m>=3&&m<=5?1:m>=6&&m<=8?2:m>=9&&m<=11?3:4;
 const sm=[3,6,9,0][q-1],sy=q===4?fy+1:fy;const start=new Date(sy,sm,1).getTime();const end=new Date(sy,sm+3,1).getTime()-1;
 return{q,fy,start,end,label:`Q${q} FY${String(fy).slice(2)}-${String(fy+1).slice(2)}`}}

/* ================= state ================= */
const LS='akrit.v1';
const S={view:'select',role:null,profiles:{},lang:'en',offline:false,loading:true,local:{m:{},p:{}},remote:{m:{},p:{}},queue:[],notified:{},reports:[],
 tab:{kabadi:'home',shop:'home',compliance:'overview'},ob:null,ui:{},db:null,dbState:'connecting',rev:0,pub:null};
function persist(){try{localStorage.setItem(LS,JSON.stringify({profiles:S.profiles,role:S.role,lang:S.lang,local:S.local,queue:S.queue,notified:S.notified,reports:S.reports}))}catch(e){}}
function restore(){try{const j=JSON.parse(localStorage.getItem(LS)||'null');if(j){S.profiles=j.profiles||{};S.role=j.role||null;S.lang=j.lang||'en';S.local=j.local||{m:{},p:{}};S.local.m=S.local.m||{};S.local.p=S.local.p||{};S.queue=j.queue||[];S.notified=j.notified||{};S.reports=j.reports||[]}}catch(e){}}
const prof=()=>S.role?S.profiles[S.role]:null;
const isOffline=()=>S.offline||(typeof navigator!=='undefined'&&navigator.onLine===false);
const bump=()=>{S.rev++};

/* ================= sample data (never written to the shared store) ================= */
function mulberry(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function buildSample(){
 const R=mulberry(11),now=Date.now(),q=quarterOf(now),span=Math.max(3,Math.min(37,Math.floor((now-q.start)/DAY)));
 const kz=['Dharavi','Dharavi','Dharavi','Kurla','Kurla','Andheri','Vasai','Vasai','Navi Mumbai','Navi Mumbai','Thane','Dharavi','Kurla'];
 const named=['Imran Shaikh','Dattu Pawar','Sunita Kamble'];
 const gens=kz.map((z,i)=>({id:'sk'+i,role:'kabadi',zone:z,name:i<3?named[i]:'Collector',named:i<3,code:'G-'+(4100+i*37)}));
 const shops=[['Lamington Mobile Care','Grant Road'],['Shree Ganesh Repairs','Andheri'],['Kurla Circuit House','Kurla'],['Andheri Phone Clinic','Andheri'],['Navi Tech Services','Navi Mumbai'],['Thane Laptop Works','Thane'],['Vasai Digital Fix','Vasai'],['Grant Road Electronics','Grant Road'],['Sai Gadget Repair','Dharavi']];
 shops.forEach((s,i)=>gens.push({id:'ss'+i,role:'shop',zone:s[1],name:s[0],named:i%3!==2,code:'G-'+(5200+i*41)}));
 const wk={kabadi:['phone','wire','mixed','battery','phone','laptop','board'],shop:['board','phone','laptop','board','battery','mixed']};
 const rng={phone:[6,30],laptop:[10,40],wire:[8,45],battery:[5,25],board:[3,14],mixed:[12,50]};
 const out=[];let base=0;
 for(let i=0;i<46;i++){
  const g=gens[Math.floor(R()*gens.length)],cs=wk[g.role],cat=cs[Math.floor(R()*cs.length)],[lo,hi]=rng[cat];
  const wl=Math.round((lo+R()*(hi-lo))*10)/10,da=Math.floor(R()*span),h=8+Math.floor(R()*10),m=Math.floor(R()*60);
  const pickupAt=sod(now-da*DAY)+h*36e5+m*6e4;if(pickupAt>now)continue;
  let status='verified';const r=R();if(da<=1&&r<.6)status='pending';else if(r>.93)status='flagged';
  const rid=ZREC[g.zone],z=ZONES[g.zone];
  let wv=null,deliveredAt=null,paid=null,note='';
  if(status!=='pending'){const f=status==='flagged'?.74+R()*.1:.94+R()*.07;wv=Math.round(wl*f*10)/10;deliveredAt=pickupAt+(90+Math.floor(R()*240))*6e4;if(status==='verified')base+=wv;else note='Weight differs by more than 10%'}
  out.push({id:`AKR-${String(q.start?new Date(pickupAt).getFullYear()%100:0)}${pad(new Date(pickupAt).getMonth()+1)}-MH-${String(10000+Math.floor(R()*89999))}`,gid:g.id,gname:g.name,gcode:g.code,role:g.role,named:g.named,zone:g.zone,cat,wl,wv,paid,rid,pickupAt,deliveredAt,status,
   lat:+(z[0]+(R()-.5)*.02).toFixed(5),lng:+(z[1]+(R()-.5)*.02).toFixed(5),photo:null,photoSample:false,note,u:pickupAt,demo:true});
 }
 const f=(1200*.68)/Math.max(base,1);
 out.forEach(m=>{m.wl=Math.round(m.wl*f*10)/10;if(m.wv!=null){m.wv=Math.round(m.wv*f*10)/10;m.paid=m.status==='verified'?Math.round(m.wv*CAT[m.cat].rate):null}});
 return out;
}
let SAMPLE=[];

/* ================= store ================= */
let _all=null,_allRev=-1;
const sampleOn=()=>S.profiles.compliance?S.profiles.compliance.includeSample!==false:true;
function getAll(){
 if(_all&&_allRev===S.rev)return _all;
 const map=new Map();if(sampleOn())SAMPLE.forEach(m=>map.set(m.id,m));
 for(const src of [S.remote.m,S.local.m])for(const id in src){const r=src[id];const c=map.get(id);if(!c||(r.u||0)>=(c.u||0))map.set(id,r)}
 _all=[...map.values()];_allRev=S.rev;return _all}
const getM=id=>getAll().find(m=>m.id===id)||(sampleOn()?null:SAMPLE.find(m=>m.id===id));
function allPickups(){const map={};for(const src of [S.remote.p,S.local.p])for(const id in src)map[id]=src[id];return Object.values(map)}
const mine=()=>{const p=prof();return p?getAll().filter(m=>m.gid===p.id):[]};
const amountExp=m=>m.wl*CAT[m.cat].rate;
const amountOf=m=>m.status==='verified'?(m.paid??m.wv*CAT[m.cat].rate):null;

function mkId(){const d=new Date();return`AKR-${String(d.getFullYear()%100)}${pad(d.getMonth()+1)}-MH-${String(10000+Math.floor(Math.random()*89999))}`}
function putM(m){m.u=Date.now();S.local.m[m.id]=m;if(!S.queue.some(q=>q.k==='m'&&q.id===m.id))S.queue.push({k:'m',id:m.id});bump();persist();trySync()}
function putP(p){p.u=Date.now();S.local.p[p.id]=p;if(!S.queue.some(q=>q.k==='p'&&q.id===p.id))S.queue.push({k:'p',id:p.id});bump();persist();trySync()}
function newManifest({cat,wl,photo,photoSample,when,zoneOverride}){
 const p=prof(),z=zoneOverride||p.zone||'Dharavi',rid=ZREC[z],c=ZONES[z];
 const m={id:mkId(),gid:p.id,gname:p.role==='shop'?p.shopName:(p.name||'Kabadiwala ••'+p.phone.slice(-4)),gcode:'G-'+p.id.slice(-4).toUpperCase(),role:p.role,named:p.role==='shop'?p.named!==false:!!p.named,zone:z,cat,wl:+wl,wv:null,paid:null,rid,
  pickupAt:when||Date.now(),deliveredAt:null,status:'pending',lat:+(c[0]+(Math.random()-.5)*.008).toFixed(5),lng:+(c[1]+(Math.random()-.5)*.008).toFixed(5),photo:photo||null,photoSample:!!photoSample,note:'',u:Date.now()};
 putM(m);return m}
function verifyM(m,wv,flagNote){
 const n={...m,wv:+wv,deliveredAt:Date.now()};const delta=Math.abs(wv-m.wl)/m.wl;
 if(flagNote){n.status='flagged';n.note=flagNote;n.paid=null}
 else if(delta>.10){n.status='flagged';n.note='Weight differs by '+Math.round(delta*100)+'%';n.paid=null}
 else{n.status='verified';n.paid=Math.round(wv*CAT[m.cat].rate);n.note=''}
 putM(n);return n}

/* ================= sync (shared store) ================= */
let syncing=false;
async function trySync(){
 if(syncing||isOffline()||!S.db||!S.queue.length)return;
 syncing=true;let n=0;
 try{for(const q of [...S.queue]){
   const rec=(q.k==='m'?S.local.m:S.local.p)[q.id];
   if(rec)await S.db.doc((q.k==='m'?'manifests/':'pickups/')+q.id).set(rec);
   S.queue=S.queue.filter(x=>!(x.k===q.k&&x.id===q.id));n++}
  S.dbState='live';persist();
  if(S.ui.wasOffline&&n){S.ui.wasOffline=false;const p=prof();if(p&&p.role==='kabadi')push(S.lang==='en'?`Back online. ${n} handover${n>1?'s are':' is'} now registered.`:'नेटवर्क वापस आ गया। आपके हैंडओवर दर्ज हो गए।')}
 }catch(e){S.dbState=(e&&e.code==='invalid_argument')?'readonly':'error'}
 finally{syncing=false;softRender()}
}
async function initDb(){
 setTimeout(()=>{if(S.loading){S.loading=false;softRender()}},1400);
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
const _caps={};
function cap(name){return _caps[name]||(_caps[name]=(async()=>{try{return window.claude&&window.claude.use?await window.claude.use(name):null}catch(e){return null}})())}
async function saveFile(name,data){
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
}

/* ================= notifications ================= */
function toast(text,opts={}){
 const el=document.createElement('div');el.className='toast';
 el.innerHTML=`${opts.push?`<div class="app">${ic('mark')} Akrit</div>`:''}<div>${esc(text)}</div>`;
 $('#toasts').appendChild(el);setTimeout(()=>el.remove(),opts.push?9000:4200)}
const push=text=>toast(text,{push:true});
function checkNotifs(){
 const p=prof();if(!p||p.role==='compliance')return;
 let ch=false;
 for(const m of mine()){
  if(m.status==='pending')continue;const key=m.id+':'+m.status;if(S.notified[key])continue;S.notified[key]=1;ch=true;
  const r=REC[m.rid].name;
  if(m.status==='verified'){
   if(p.role==='kabadi')push(S.lang==='en'?`Your handover of ${nf(m.wv)}kg was confirmed by ${r}. ${inr(amountOf(m))} credited.`:S.lang==='hi'?`आपका ${nf(m.wv)} किलो का हैंडओवर ${r} ने पक्का किया। ${inr(amountOf(m))} जमा हुए।`:`तुमचे ${nf(m.wv)} किलोचे हस्तांतरण ${r} ने निश्चित केले. ${inr(amountOf(m))} जमा झाले.`);
   else push(`${r} verified your ${nf(m.wv)}kg of ${CAT[m.cat].en.toLowerCase()}. ${inr(amountOf(m))} is added to your waste history.`)}
  else push(`Handover ${m.id} needs a check: ${m.note||'flagged by the recycler'}. Call support if you need help.`)}
 if(ch)persist()}

/* ================= QR ================= */
function baseUrl(){try{const u=location.href.split('#')[0];return /^https?:/.test(u)?u:''}catch(e){return''}}
function mLink(id){const b=baseUrl();return b?`${b}#m-${id}`:`AKRIT:${id}`}
function qrMatrix(text){try{const q=qrcode(0,'M');q.addData(text);q.make();const n=q.getModuleCount();return{n,d:(r,c)=>q.isDark(r,c)}}catch(e){return null}}
function qrSvg(text){
 const q=qrMatrix(text);if(!q)return'<div style="width:96px;height:96px;display:grid;place-items:center;font-size:.7rem;color:#555">QR unavailable</div>';
 let d='';for(let r=0;r<q.n;r++)for(let c=0;c<q.n;c++)if(q.d(r,c))d+=`M${c} ${r}h1v1h-1z`;
 return`<svg viewBox="0 0 ${q.n} ${q.n}" shape-rendering="crispEdges" role="img" aria-label="QR code for verifying this manifest"><path d="${d}"/></svg>`}

/* ================= PDF ================= */
const TEAL=[13,92,99];
function fitTxt(d,s,w){s=String(s);while(d.getTextWidth(s)>w&&s.length>1)s=s.slice(0,-1);return s}
function pdfTable(d,y,cols,rows,rh=6.4){
 const M=14,W=210;
 const hdr=()=>{d.setFillColor(...TEAL);d.rect(M,y,W-2*M,rh+.8,'F');d.setTextColor(255);d.setFont('helvetica','bold');d.setFontSize(7.5);let x=M;cols.forEach(c=>{d.text(c.h,c.r?x+c.w-1.5:x+1.5,y+4.7,{align:c.r?'right':'left'});x+=c.w});y+=rh+.8;d.setFont('helvetica','normal');d.setTextColor(27,40,41)};
 hdr();
 rows.forEach((r,i)=>{
  if(y>276){d.addPage();y=16;hdr()}
  if(i%2){d.setFillColor(244,241,236);d.rect(M,y,W-2*M,rh,'F')}
  let x=M;cols.forEach((c,j)=>{d.setFontSize(7.5);d.setFont(c.mono?'courier':'helvetica','normal');const s=fitTxt(d,r[j]??'',c.w-3);d.text(s,c.r?x+c.w-1.5:x+1.5,y+4.4,{align:c.r?'right':'left'});x+=c.w});
  y+=rh});
 return y}
function pdfFooters(d,label){const n=d.getNumberOfPages();for(let i=1;i<=n;i++){d.setPage(i);d.setFontSize(7.5);d.setFont('helvetica','normal');d.setTextColor(110,120,122);d.text(label,14,291);d.text(`Page ${i} of ${n}`,196,291,{align:'right'})}}
function pdfQr(d,text,x,y,size){
 const q=qrMatrix(text);d.setFillColor(255,255,255);d.rect(x-2,y-2,size+4,size+4,'F');if(!q)return;
 const u=size/q.n;d.setFillColor(20,32,31);for(let r=0;r<q.n;r++)for(let c=0;c<q.n;c++)if(q.d(r,c))d.rect(x+c*u,y+r*u,u+.02,u+.02,'F')}
const JS=()=>window.jspdf&&window.jspdf.jsPDF;
async function pdfManifest(m,cpcb){
 if(!JS()){toast('The PDF tool did not load. Check your connection and try again.');return}
 const d=new (JS())({unit:'mm',format:'a4'}),W=210,rec=REC[m.rid],link=mLink(m.id);
 d.setTextColor(232,238,238);d.setFont('helvetica','bold');d.setFontSize(84);d.text('SANCHAY',W/2+4,170,{align:'center',angle:32});
 d.setFillColor(...TEAL);d.rect(0,0,W,40,'F');d.setTextColor(255);d.setFontSize(21);d.text(cpcb?'E-waste handover manifest':'Akrit Digital Manifest',14,19);
 d.setFont('helvetica','normal');d.setFontSize(9);d.text(cpcb?'Prepared for CPCB EPR portal records · issued via Sanchay verification':'Verified handover certificate · issued via Sanchay verification',14,28);
 pdfQr(d,link,W-14-26,7,26);
 d.setTextColor(...TEAL);d.setFont('courier','bold');d.setFontSize(21);d.text(m.id,14,56);
 d.setDrawColor(200,194,180);d.setLineDashPattern([1.2,1.2],0);d.line(14,61,W-14,61);d.setLineDashPattern([],0);
 const rows=[['Generator',(m.named?m.gname:'Anonymised generator '+m.gcode)+' · '+m.zone],['Generator type',m.role==='shop'?'Repair shop':'Kabadiwala (informal collector)'],['Waste category',CAT[m.cat].en+' (e-waste)'],
  ['Recycler',rec.name],['CPCB licence',rec.lic],['Pickup',fmtDT(m.pickupAt)],['Delivery confirmed',m.deliveredAt?fmtDT(m.deliveredAt):'Awaiting recycler'],['GPS of handover',m.lat.toFixed(5)+' N, '+m.lng.toFixed(5)+' E']];
 let y=71;rows.forEach(r=>{d.setFont('helvetica','normal');d.setFontSize(9);d.setTextColor(95,105,107);d.text(r[0],14,y);d.setFont('helvetica','bold');d.setFontSize(10.5);d.setTextColor(27,40,41);d.text(r[1],W-14,y,{align:'right'});y+=9});
 d.setFillColor(231,241,241);d.roundedRect(14,y+2,W-28,30,2,2,'F');
 d.setFont('helvetica','normal');d.setFontSize(8.5);d.setTextColor(95,105,107);d.text('Logged by generator',30,y+11);d.text('Verified by recycler',W-30,y+11,{align:'right'});
 d.setFont('helvetica','bold');d.setFontSize(20);d.setTextColor(27,40,41);d.text(nf(m.wl)+' kg',30,y+22);d.text(m.wv!=null?nf(m.wv)+' kg':'Pending',W-30,y+22,{align:'right'});
 if(m.wv!=null){const dl=m.wv-m.wl;d.setFontSize(9);d.setTextColor(95,105,107);d.text((dl>=0?'+':'')+nf(dl)+' kg ('+(dl/m.wl*100).toFixed(1)+'%)',W/2,y+22,{align:'center'})}
 y+=42;const st={verified:['EPR CREDIT ELIGIBLE',[23,101,61],[228,244,234]],pending:['AWAITING RECYCLER CONFIRMATION',[138,75,0],[251,235,214]],flagged:['FLAGGED FOR REVIEW',[179,38,30],[251,229,226]]}[m.status];
 d.setFillColor(...st[2]);d.setDrawColor(...st[1]);d.setLineWidth(.7);d.roundedRect(14,y,W-28,16,2,2,'FD');d.setTextColor(...st[1]);d.setFontSize(13);d.text(st[0],W/2,y+10.3,{align:'center'});
 if(m.note){d.setFont('helvetica','normal');d.setFontSize(9);d.setTextColor(95,105,107);d.text('Note: '+m.note,14,y+24)}
 d.setFont('helvetica','normal');d.setFontSize(8);d.setTextColor(110,120,122);d.text('Scan the QR code or open the link to verify this manifest: '+(link.length>90?link.slice(0,90)+'...':link),14,282);
 d.text('Generated '+fmtDT(Date.now())+'. Weights in kilograms.',14,287);
 await saveFile(`Akrit-${cpcb?'CPCB-':''}${m.id}.pdf`,d.output('arraybuffer'))}

async function pdfHistory(p,rows,desc){
 if(!JS()){toast('The PDF tool did not load. Check your connection and try again.');return}
 const d=new (JS())({unit:'mm',format:'a4'});
 d.setFillColor(...TEAL);d.rect(0,0,210,34,'F');d.setTextColor(255);d.setFont('helvetica','bold');d.setFontSize(18);d.text('Green Shop record',14,16);d.setFont('helvetica','normal');d.setFontSize(9);d.text('E-waste handover history · generated through Akrit',14,24);
 d.setTextColor(27,40,41);d.setFont('helvetica','bold');d.setFontSize(12);d.text(p.shopName,14,46);d.setFont('helvetica','normal');d.setFontSize(9);d.setTextColor(95,105,107);
 d.text(`Phone ${p.phone}${p.gst?' · GSTIN '+p.gst:''}`,14,52);d.text(`Generated ${fmtDT(Date.now())} · ${desc}`,14,57);
 const v=rows.filter(m=>m.status==='verified');
 d.setTextColor(27,40,41);d.setFont('helvetica','bold');d.setFontSize(10);d.text(`${rows.length} handovers · ${nf(sum(v,m=>m.wv))} kg verified · Rs. ${Math.round(sum(v,m=>amountOf(m))).toLocaleString('en-IN')} paid`,14,66);
 pdfTable(d,71,[{h:'Manifest ID',w:36,mono:1},{h:'Date',w:23},{h:'Category',w:20},{h:'Recycler',w:40},{h:'Logged kg',w:20,r:1},{h:'Verified kg',w:21,r:1},{h:'Paid (Rs.)',w:22,r:1}],
  rows.map(m=>[m.id,fmtD(m.pickupAt),CAT[m.cat].en,REC[m.rid].name,nf(m.wl),m.wv!=null?nf(m.wv):'-',amountOf(m)!=null?Math.round(amountOf(m)).toLocaleString('en-IN'):'-']));
 pdfFooters(d,'Akrit · Green Shop record · each manifest can be verified by its QR code');
 await saveFile(`Green-Shop-record-${ymd(Date.now())}.pdf`,d.output('arraybuffer'))}

async function pdfReport(p,o,rows){
 if(!JS()){toast('The PDF tool did not load. Check your connection and try again.');return false}
 const d=new (JS())({unit:'mm',format:'a4'}),ver=rows.filter(m=>m.status==='verified'),kgV=sum(ver,m=>m.wv),tgt=p.target,pct=kgV/tgt*100;
 d.setFillColor(...TEAL);d.rect(0,0,210,36,'F');d.setTextColor(255);d.setFont('helvetica','bold');d.setFontSize(19);d.text('EPR compliance report',14,17);d.setFont('helvetica','normal');d.setFontSize(9);d.text('Structured for CPCB EPR portal upload · e-waste handovers verified through Akrit',14,26);
 const ref='RPT-'+ymd(Date.now()).replace(/-/g,'').slice(2)+'-'+rid4().toUpperCase();
 d.setTextColor(27,40,41);d.setFontSize(12);d.setFont('helvetica','bold');d.text(p.company,14,48);d.setFont('helvetica','normal');d.setFontSize(9);d.setTextColor(95,105,107);
 d.text(`${p.idType} ${p.idNo} · ${p.email}`,14,54);d.text(`Period ${fmtD(parseYmd(o.from))} to ${fmtD(parseYmd(o.to,1))} · Reference ${ref} · Generated ${fmtDT(Date.now())}`,14,59);
 let y=69;const box=(x,w,l,v)=>{d.setFillColor(244,241,236);d.roundedRect(x,y,w,20,2,2,'F');d.setFontSize(7.5);d.setTextColor(95,105,107);d.setFont('helvetica','normal');d.text(l,x+4,y+7);d.setFontSize(14);d.setFont('helvetica','bold');d.setTextColor(27,40,41);d.text(v,x+4,y+15.5)};
 box(14,43,'Manifests in report',String(rows.length));box(60,43,'Verified weight',nf(kgV)+' kg');box(106,43,'EPR credits claimable',String(Math.floor(kgV/p.kgPerCredit)));box(152,44,'Against quarterly target',pct.toFixed(1)+'%');
 y+=28;d.setFont('helvetica','bold');d.setFontSize(10);d.setTextColor(27,40,41);d.text('By category',14,y);y+=3;
 const bc=CATS.map(c=>{const r=ver.filter(m=>m.cat===c.id);return[c.en,String(r.length),nf(sum(r,m=>m.wv))]}).filter(r=>+r[1]>0);
 y=pdfTable(d,y,[{h:'Category',w:100},{h:'Verified manifests',w:40,r:1},{h:'Verified kg',w:42,r:1}],bc.length?bc:[['No verified handovers in this selection','0','0']])+8;
 d.setFont('helvetica','bold');d.setFontSize(10);d.text('By recycler',14,y);y+=3;
 const br=Object.values(REC).map(r=>{const x=ver.filter(m=>m.rid===r.id);return[r.name,r.lic,String(x.length),nf(sum(x,m=>m.wv))]}).filter(r=>+r[2]>0);
 y=pdfTable(d,y,[{h:'Recycler',w:62},{h:'CPCB licence',w:50,mono:1},{h:'Manifests',w:30,r:1},{h:'Verified kg',w:40,r:1}],br.length?br:[['None','','0','0']])+10;
 if(y>235){d.addPage();y=18}
 d.setFont('helvetica','bold');d.setFontSize(10);d.text('Declaration',14,y);d.setFont('helvetica','normal');d.setFontSize(8.5);d.setTextColor(60,70,72);
 d.text(d.splitTextToSize('Each manifest in the annexure carries a QR code that resolves to its record: generator, recycler, licence, weights, timestamps and GPS point. Verified weight is the weight confirmed by the recycler at delivery.',182),14,y+6);
 d.setDrawColor(60,70,72);d.setLineWidth(.2);d.line(14,y+30,84,y+30);d.line(120,y+30,196,y+30);d.setFontSize(8);d.text('Authorised signatory',14,y+34);d.text('Date and company seal',120,y+34);
 d.addPage();d.setTextColor(27,40,41);d.setFont('helvetica','bold');d.setFontSize(12);d.text('Annexure: manifests',14,18);
 pdfTable(d,23,[{h:'Manifest ID',w:34,mono:1},{h:'Date',w:21},{h:'Generator',w:34},{h:'Category',w:18},{h:'Logged',w:15,r:1},{h:'Verified',w:16,r:1},{h:'Recycler',w:30},{h:'Status',w:14}],
  rows.map(m=>[m.id,fmtD(m.pickupAt),(m.named&&!p.anonymize)?m.gname:'Anonymised '+m.gcode,CAT[m.cat].en,nf(m.wl),m.wv!=null?nf(m.wv):'-',REC[m.rid].name,m.status[0].toUpperCase()+m.status.slice(1)]),6);
 pdfFooters(d,`${p.company} · ${ref}`);
 return {ok:await saveFile(`EPR-report-${o.from}-to-${o.to}.pdf`,d.output('arraybuffer')),ref,kg:kgV}}
