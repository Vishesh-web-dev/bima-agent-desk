(function(){
'use strict';
var $=function(s,r){return (r||document).querySelector(s);};
var $$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s));};
var ls={get:function(k,d){try{var v=localStorage.getItem(k);return v==null?d:JSON.parse(v);}catch(e){return d;}},set:function(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch(e){}}};
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}

/* ---------- Tabs ---------- */
var TABS=['plan','messages','clients'];
function showTab(){var t=(location.hash||'').slice(1);if(TABS.indexOf(t)<0)t='plan';TABS.forEach(function(x){$('#view-'+x).hidden=x!==t;$('#tab-'+x).setAttribute('aria-current',x===t?'page':'false');});}
window.addEventListener('hashchange',function(){showTab();window.scrollTo(0,0);});
showTab();

/* ---------- Checklist ---------- */
var done=ls.get('bad.todo',{});
function updateProgress(){var all=$$('.todo input');var n=all.filter(function(c){return c.checked;}).length;$('#todo-progress').textContent=n+' of '+all.length+' done';}
$$('.todo input').forEach(function(cb){cb.checked=!!done[cb.id];cb.addEventListener('change',function(){done[cb.id]=cb.checked;ls.set('bad.todo',done);updateProgress();});});
updateProgress();

/* ---------- Messages ---------- */
var PH={name:'Name',me:'Your name',phone:'Your phone',date:'expiry date',vehicle:'vehicle no.',type:'policy'};
var TPL=[
 {id:'launch',title:'Tell everyone you know',when:'Week 2 · family, friends, neighbours, colleagues',
  en:"Hi {name}, some news: I'm now a licensed insurance agent with National Insurance Company, a Government of India company. I can arrange car, bike, health, shop and home insurance, and I'll personally help you if you ever need to claim.\n\nCould you tell me when your vehicle or health policy is due for renewal? I'll send a quote a few weeks before, with no obligation.\n\n– {me}, {phone}",
  hi:"नमस्ते {name}, एक खुशखबरी: मैं अब National Insurance Company (भारत सरकार की कंपनी) का लाइसेंस वाला बीमा एजेंट हूँ। कार, बाइक, हेल्थ, दुकान और घर का बीमा करवा सकता हूँ, और क्लेम के समय खुद साथ रहूँगा।\n\nआपकी गाड़ी या हेल्थ पॉलिसी कब रिन्यू होनी है, बता देंगे? मैं कुछ हफ्ते पहले कोटेशन भेज दूँगा, लेना ज़रूरी नहीं।\n\n– {me}, {phone}",
  gu:"નમસ્તે {name}, એક સારા સમાચાર: હવે હું National Insurance Company (ભારત સરકારની કંપની) નો લાયસન્સ ધરાવતો વીમા એજન્ટ છું. કાર, બાઇક, હેલ્થ, દુકાન અને ઘરનો વીમો કરાવી આપું છું, અને ક્લેમ વખતે હું જાતે સાથે રહીશ.\n\nતમારી ગાડી કે હેલ્થ પોલિસી ક્યારે રિન્યુ કરવાની છે એ જણાવશો? હું થોડા અઠવાડિયા પહેલાં ક્વોટેશન મોકલી આપીશ, લેવું ફરજિયાત નથી.\n\n– {me}, {phone}"},
 {id:'motor',title:'Ask for the vehicle renewal date',when:'Anyone with a car, bike or commercial vehicle',
  en:"Hi {name}, when does your car or bike insurance expire? Send me a photo of the current policy and I'll check the IDV, no-claim bonus and add-ons, then send you a renewal quote. If you've ever had trouble with a claim, I can help with that too.\n\n– {me}, {phone}",
  hi:"नमस्ते {name}, आपकी कार या बाइक का बीमा कब खत्म हो रहा है? मौजूदा पॉलिसी की फोटो भेज दीजिए, मैं IDV, नो-क्लेम बोनस और ऐड-ऑन चेक करके रिन्यूअल कोटेशन भेज दूँगा। क्लेम में कभी दिक्कत आई हो तो उसमें भी मदद करूँगा।\n\n– {me}, {phone}",
  gu:"નમસ્તે {name}, તમારી કાર કે બાઇકનો વીમો ક્યારે પૂરો થાય છે? હાલની પોલિસીનો ફોટો મોકલો, હું IDV, નો-ક્લેમ બોનસ અને એડ-ઓન ચેક કરીને રિન્યુઅલ ક્વોટેશન મોકલી આપીશ. ક્લેમમાં ક્યારેય તકલીફ પડી હોય તો એમાં પણ મદદ કરીશ.\n\n– {me}, {phone}"},
 {id:'health',title:'Health cover for parents',when:'Anyone whose parents are over 55',
  en:"Hi {name}, a quick one about your parents' health cover. Since September 2025 there's no GST on individual health insurance, and since April 2024 there's no upper age limit for buying a new health policy.\n\nIf your parents aren't covered yet, or their cover is small, I can show you National Insurance plans for them and explain the waiting periods clearly before you decide.\n\n– {me}, {phone}",
  hi:"नमस्ते {name}, आपके माता-पिता के हेल्थ इंश्योरेंस के बारे में एक बात। सितंबर 2025 से व्यक्तिगत हेल्थ इंश्योरेंस पर GST नहीं लगता, और अप्रैल 2024 से नई हेल्थ पॉलिसी लेने की कोई ऊपरी उम्र सीमा नहीं है।\n\nअगर उनका बीमा नहीं है या कवर कम है, तो मैं National Insurance के प्लान दिखा दूँगा और वेटिंग पीरियड पहले ही साफ़-साफ़ समझा दूँगा।\n\n– {me}, {phone}",
  gu:"નમસ્તે {name}, તમારા માતા-પિતાના હેલ્થ ઇન્શ્યોરન્સ વિશે એક વાત. સપ્ટેમ્બર 2025 થી વ્યક્તિગત હેલ્થ ઇન્શ્યોરન્સ પર GST નથી લાગતો, અને એપ્રિલ 2024 થી નવી હેલ્થ પોલિસી લેવા માટે ઉંમરની કોઈ ઉપલી મર્યાદા નથી.\n\nજો તેમનો વીમો નથી અથવા કવર ઓછું છે, તો હું National Insurance ના પ્લાન બતાવીશ અને વેઇટિંગ પીરિયડ પહેલેથી સ્પષ્ટ સમજાવીશ.\n\n– {me}, {phone}"},
 {id:'reminder',title:'Renewal reminder',when:'30 days before expiry · the Clients tab fills this in for each person',
  en:"Hi {name}, a reminder: the insurance on {vehicle} expires on {date}. Renewing before that date avoids a vehicle inspection and keeps your no-claim bonus. Send me the current policy or RC photo and I'll share the quote today.\n\n– {me}, {phone}",
  hi:"नमस्ते {name}, याद दिला दूँ: {vehicle} का बीमा {date} को खत्म हो रहा है। इससे पहले रिन्यू करने पर गाड़ी का इंस्पेक्शन नहीं लगता और नो-क्लेम बोनस बचा रहता है। मौजूदा पॉलिसी या RC की फोटो भेज दीजिए, आज ही कोटेशन भेज दूँगा।\n\n– {me}, {phone}",
  gu:"નમસ્તે {name}, યાદ અપાવું: {vehicle} નો વીમો {date} ના રોજ પૂરો થાય છે. એ પહેલાં રિન્યુ કરવાથી ગાડીનું ઇન્સ્પેક્શન નથી કરાવવું પડતું અને નો-ક્લેમ બોનસ સચવાય છે. હાલની પોલિસી કે RC નો ફોટો મોકલો, આજે જ ક્વોટેશન મોકલી આપીશ.\n\n– {me}, {phone}"},
 {id:'shop',title:'Shop owners',when:'Week 3 · after a visit, or to shop owners you know',
  en:"Namaste {name}ji, I'm {me}, a licensed agent with National Insurance Company (a Government of India company). A shopkeeper's policy covers your shop's stock, furniture and cash against fire, burglary and similar losses. The premium depends on your stock value, so I'd like to give you an exact quote. Can I come by for 10 minutes this week?\n\n– {phone}",
  hi:"नमस्ते {name}जी, मैं {me}, National Insurance Company (भारत सरकार की कंपनी) का लाइसेंस वाला एजेंट हूँ। शॉपकीपर पॉलिसी में दुकान का माल, फर्नीचर और कैश आग, चोरी जैसे नुकसान से कवर होता है। प्रीमियम माल की कीमत पर निर्भर करता है, इसलिए सही कोटेशन देना चाहूँगा। इस हफ्ते 10 मिनट के लिए आ सकता हूँ?\n\n– {phone}",
  gu:"નમસ્તે {name}જી, હું {me}, National Insurance Company (ભારત સરકારની કંપની) નો લાયસન્સ ધરાવતો એજન્ટ છું. શોપકીપર પોલિસીમાં દુકાનનો માલ, ફર્નિચર અને રોકડ આગ, ચોરી જેવા નુકસાન સામે કવર થાય છે. પ્રીમિયમ માલની કિંમત પર આધાર રાખે છે, એટલે ચોક્કસ ક્વોટેશન આપવા માગું છું. આ અઠવાડિયે 10 મિનિટ માટે મળી શકું?\n\n– {phone}"},
 {id:'partner',title:'Partners',when:'Garages, used-car dealers, RTO agents, visa consultants, CAs, property brokers',
  en:"Namaste {name}ji, I'm {me}, a licensed National Insurance agent here in Ahmedabad. Your customers often need insurance right when they come to you: a vehicle sale or transfer, a renewal, a trip abroad, a new shop or home.\n\nIf you point them to me, I'll handle the policy properly and stand with them during claims, and I'll send customers your way too. Could we meet for 10 minutes this week?\n\n– {phone}",
  hi:"नमस्ते {name}जी, मैं {me}, अहमदाबाद में National Insurance का लाइसेंस वाला एजेंट हूँ। आपके ग्राहकों को अक्सर उसी समय बीमे की ज़रूरत होती है जब वे आपके पास आते हैं: गाड़ी की खरीद-बिक्री या ट्रांसफर, रिन्यूअल, विदेश यात्रा, नई दुकान या घर।\n\nआप उन्हें मेरे पास भेजें, मैं पॉलिसी सही तरीके से करवाऊँगा और क्लेम में साथ रहूँगा, और मैं भी अपने ग्राहक आपके पास भेजूँगा। इस हफ्ते 10 मिनट मिल सकते हैं?\n\n– {phone}",
  gu:"નમસ્તે {name}જી, હું {me}, અમદાવાદમાં National Insurance નો લાયસન્સ ધરાવતો એજન્ટ છું. તમારા ગ્રાહકોને ઘણી વાર એ જ સમયે વીમાની જરૂર પડે છે જ્યારે તેઓ તમારી પાસે આવે છે: ગાડીની લે-વેચ કે ટ્રાન્સફર, રિન્યુઅલ, વિદેશ પ્રવાસ, નવી દુકાન કે ઘર.\n\nતમે એમને મારી પાસે મોકલો, હું પોલિસી બરાબર કરાવીશ અને ક્લેમમાં સાથે રહીશ, અને હું પણ મારા ગ્રાહકો તમારી પાસે મોકલીશ. આ અઠવાડિયે 10 મિનિટ મળી શકીએ?\n\n– {phone}"},
 {id:'thanks',title:'Thank you, referrals and a review',when:'Right after every policy is issued',
  en:"Thank you for trusting me, {name}. Your policy PDF is attached. Please save my number; if you ever need to claim, call me first and I'll guide you through it.\n\nOne small request: could you share two family members or friends whose car, bike or health policy is due soon? I'll look after them the same way. And if you're happy with my service, a short Google review would help me a lot.\n\n– {me}, {phone}",
  hi:"भरोसा करने के लिए धन्यवाद {name}। आपकी पॉलिसी की PDF भेज दी है। मेरा नंबर सेव कर लीजिए; कभी क्लेम करना हो तो पहले मुझे फोन करें, मैं पूरा प्रोसेस करवाऊँगा।\n\nएक छोटी सी गुज़ारिश: परिवार या दोस्तों में से दो लोगों के नाम बता दीजिए जिनकी कार, बाइक या हेल्थ पॉलिसी जल्द रिन्यू होनी है। मैं उनका भी इसी तरह ध्यान रखूँगा। और अगर मेरी सर्विस अच्छी लगी हो तो Google पर एक छोटा सा रिव्यू दे दीजिए, बहुत मदद होगी।\n\n– {me}, {phone}",
  gu:"વિશ્વાસ મૂકવા બદલ આભાર {name}. તમારી પોલિસીની PDF મોકલી છે. મારો નંબર સેવ કરી લેજો; ક્યારેય ક્લેમ કરવાનો થાય તો પહેલાં મને ફોન કરજો, હું આખી પ્રોસેસ કરાવી આપીશ.\n\nએક નાની વિનંતી: પરિવાર કે મિત્રોમાંથી બે લોકોના નામ જણાવશો જેમની કાર, બાઇક કે હેલ્થ પોલિસી જલ્દી રિન્યુ થવાની છે? હું એમનું પણ આ જ રીતે ધ્યાન રાખીશ. અને જો મારી સર્વિસ ગમી હોય તો Google પર નાનો રિવ્યૂ આપજો, ઘણી મદદ થશે.\n\n– {me}, {phone}"},
 {id:'profile',title:'WhatsApp Business and Google profile text',when:'Week 1 · paste into the "About" or description field',
  en:"Licensed insurance agent, National Insurance Company Ltd. (Government of India). Car, bike, commercial vehicle, health, shop, home and travel insurance. Free policy check-up and personal help with claims. Ahmedabad. {me}, {phone}",
  hi:"National Insurance Company Ltd. (भारत सरकार) के लाइसेंस वाले बीमा एजेंट। कार, बाइक, कमर्शियल गाड़ी, हेल्थ, दुकान, घर और ट्रैवल इंश्योरेंस। पॉलिसी की मुफ्त जाँच और क्लेम में पूरी मदद। अहमदाबाद। {me}, {phone}",
  gu:"National Insurance Company Ltd. (ભારત સરકાર) ના લાયસન્સ ધરાવતા વીમા એજન્ટ. કાર, બાઇક, કોમર્શિયલ વાહન, હેલ્થ, દુકાન, ઘર અને ટ્રાવેલ ઇન્શ્યોરન્સ. પોલિસીની મફત તપાસ અને ક્લેમમાં પૂરી મદદ. અમદાવાદ. {me}, {phone}"}
];
var REM_OTHER={
  en:"Hi {name}, a reminder: your {type} policy renews on {date}. Let me know if anything has changed (family members, address, sum insured, stock value) and I'll send the renewal quote.\n\n– {me}, {phone}",
  hi:"नमस्ते {name}, याद दिला दूँ: आपकी {type} पॉलिसी {date} को रिन्यू होनी है। अगर कुछ बदला हो (परिवार के सदस्य, पता, सम इंश्योर्ड, स्टॉक की कीमत) तो बता दीजिए, मैं रिन्यूअल कोटेशन भेज दूँगा।\n\n– {me}, {phone}",
  gu:"નમસ્તે {name}, યાદ અપાવું: તમારી {type} પોલિસી {date} ના રોજ રિન્યુ કરવાની છે. કંઈ બદલાયું હોય (પરિવારના સભ્યો, સરનામું, સમ ઇન્શ્યોર્ડ, સ્ટોકની કિંમત) તો જણાવજો, હું રિન્યુઅલ ક્વોટેશન મોકલી આપીશ.\n\n– {me}, {phone}"
};

function fill(t,v,asHtml){
  var src=asHtml?esc(t):t;
  return src.replace(/\{(\w+)\}/g,function(m,k){
    var val=String(v[k]||'').trim();
    if(val)return asHtml?esc(val):val;
    var lab='['+(PH[k]||k)+']';
    return asHtml?'<mark>'+esc(lab)+'</mark>':lab;
  });
}

var lang=ls.get('bad.lang','en');if(['en','hi','gu'].indexOf(lang)<0)lang='en';
var toName=$('#to-name'),meName=$('#me-name'),mePhone=$('#me-phone');
var saved=ls.get('bad.me',{});meName.value=saved.name||'';mePhone.value=saved.phone||'';
function msgVars(){return {name:toName.value,me:meName.value,phone:mePhone.value};}
function renderMsgs(){
  $$('.lang button').forEach(function(b){b.setAttribute('aria-pressed',String(b.dataset.lang===lang));});
  var v=msgVars();
  $('#msg-list').innerHTML=TPL.map(function(t){
    var plain=fill(t[lang],v,false);
    return '<article class="msg"><header><h3>'+esc(t.title)+'</h3><p class="when">'+esc(t.when)+'</p></header>'+
      '<div class="bubble" lang="'+lang+'" id="bubble-'+t.id+'">'+fill(t[lang],v,true)+'</div>'+
      '<div class="msg-actions"><button type="button" class="btn sm" data-copy="'+t.id+'">Copy</button>'+
      '<a class="btn sm ghost" target="_blank" rel="noopener" href="https://wa.me/?text='+encodeURIComponent(plain)+'">Open in WhatsApp</a></div></article>';
  }).join('');
}
function saveMe(){ls.set('bad.me',{name:meName.value,phone:mePhone.value});}
toName.addEventListener('input',renderMsgs);
meName.addEventListener('input',function(){saveMe();renderMsgs();renderClients();});
mePhone.addEventListener('input',function(){saveMe();renderMsgs();renderClients();});
$$('.lang button').forEach(function(b){b.addEventListener('click',function(){lang=b.dataset.lang;ls.set('bad.lang',lang);renderMsgs();renderClients();});});

function copyText(text,btn,el){
  var orig=btn.dataset.label||btn.textContent;btn.dataset.label=orig;
  function ok(){btn.textContent='Copied';setTimeout(function(){btn.textContent=orig;},1600);}
  function fallback(){
    if(el){var r=document.createRange();r.selectNodeContents(el);var s=window.getSelection();s.removeAllRanges();s.addRange(r);}
    btn.textContent='Selected, now copy';setTimeout(function(){btn.textContent=orig;},2500);
  }
  try{navigator.clipboard.writeText(text).then(ok,fallback);}catch(e){fallback();}
}
$('#msg-list').addEventListener('click',function(e){
  var b=e.target.closest('[data-copy]');if(!b)return;
  var t=TPL.filter(function(x){return x.id===b.dataset.copy;})[0];if(!t)return;
  copyText(fill(t[lang],msgVars(),false),b,$('#bubble-'+t.id));
});
renderMsgs();

/* ---------- Clients ---------- */
var TYPES=[
  {v:'Car',motor:true,en:'car',hi:'कार',gu:'કાર'},
  {v:'Two-wheeler',motor:true,en:'bike',hi:'बाइक',gu:'બાઇક'},
  {v:'Commercial vehicle',motor:true,en:'vehicle',hi:'गाड़ी',gu:'વાહન'},
  {v:'Health',en:'health',hi:'हेल्थ',gu:'હેલ્થ'},
  {v:'Shop / business',en:'shop',hi:'दुकान की',gu:'દુકાનની'},
  {v:'Home',en:'home',hi:'घर की',gu:'ઘરની'},
  {v:'Travel',en:'travel',hi:'ट्रैवल',gu:'ટ્રાવેલ'},
  {v:'Personal accident',en:'personal accident',hi:'पर्सनल एक्सीडेंट',gu:'પર્સનલ એક્સિડન્ટ'},
  {v:'Other',en:'insurance',hi:'बीमा',gu:'વીમા'}
];
var STAGES=['Lead','Quote sent','Customer','Lost'];
var SOURCES=['Family','Friend','Neighbour / society','Colleague','Referral','Partner','Shop visit','Google','Other'];
function opts(sel,arr){sel.innerHTML=arr.map(function(x){return '<option>'+esc(x)+'</option>';}).join('');}
opts($('#f-type'),TYPES.map(function(t){return t.v;}));opts($('#f-stage'),STAGES);opts($('#f-source'),SOURCES);


/* mode: loading | cloud (saved in the database) | device (saved in this browser) | locked | setup | error */
var rows=[],filter='all',query='',editingId=null,mode='loading',lastLoad=0;
var pass=ls.get('bad.pass','')||'';
var statusEl=$('#cl-status');
function setStatus(msg,kind){statusEl.textContent=msg||'';statusEl.dataset.kind=kind||'';statusEl.hidden=!msg;}
function canEdit(){return mode==='cloud'||mode==='device';}

function typeOf(r){return TYPES.filter(function(t){return t.v===r.type;})[0]||TYPES[TYPES.length-1];}
function parseISO(iso){if(!iso||typeof iso!=='string')return null;var p=iso.split('-').map(Number);if(p.length!==3||!p[0]||!p[1]||!p[2])return null;return new Date(p[0],p[1]-1,p[2]);}
function daysLeft(iso){var t=parseISO(iso);if(!t)return null;var n=new Date();var today=new Date(n.getFullYear(),n.getMonth(),n.getDate());return Math.round((t-today)/86400000);}
function fmtDate(iso){var t=parseISO(iso);return t?t.toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'}):'';}
function toISO(d){return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');}
function inr(n){return '₹'+new Intl.NumberFormat('en-IN').format(Math.round(n));}
function waNum(p){var d=String(p||'').replace(/\D/g,'');if(d.length===11&&d.charAt(0)==='0')d=d.slice(1);if(d.length===10)d='91'+d;return d.length>=11?d:'';}
function reminderText(r){
  var t=typeOf(r);
  var tpl=t.motor?TPL.filter(function(x){return x.id==='reminder';})[0][lang]:REM_OTHER[lang];
  var veh={en:'your '+t.en,hi:'आपकी '+t.hi,gu:'તમારી '+t.gu}[lang];
  return fill(tpl,{name:r.name,me:meName.value,phone:mePhone.value,date:fmtDate(r.expiry),vehicle:r.detail||veh,type:t[lang]},false);
}
function isLead(r){return r.stage==='Lead'||r.stage==='Quote sent';}
function pick(r){return {name:r.name,phone:r.phone||'',type:r.type,detail:r.detail||'',expiry:r.expiry||'',premium:r.premium==null||r.premium===''?null:Number(r.premium),stage:r.stage||'Lead',source:r.source||'',notes:r.notes||''};}

function pillFor(d){
  if(d==null)return '';
  if(d< -90)return '<span class="pill">Lapsed '+(-d)+' days</span>';
  if(d<0)return '<span class="pill crit">Expired '+(-d)+(d===-1?' day':' days')+' ago</span>';
  if(d===0)return '<span class="pill crit">Expires today</span>';
  if(d<=7)return '<span class="pill crit">'+d+(d===1?' day':' days')+' left</span>';
  if(d<=30)return '<span class="pill warn">'+d+' days left</span>';
  if(d<=60)return '<span class="pill soon">in '+d+' days</span>';
  return '<span class="pill ok">in '+d+' days</span>';
}

/* ---------- Storage: database through /api/clients, or this browser ---------- */
var API='/api/clients';
function api(method,o){
  o=o||{};
  var url=o.id?API+'?id='+encodeURIComponent(o.id):API;
  var headers={'authorization':'Bearer '+pass};
  if(o.body)headers['content-type']='application/json';
  return fetch(url,{method:method,headers:headers,body:o.body?JSON.stringify(o.body):undefined,cache:'no-store'}).then(function(res){
    return res.json().catch(function(){return null;}).then(function(data){
      if(!res.ok){var e=new Error(data&&data.message||('Server error '+res.status));e.status=res.status;e.code=data&&data.error;throw e;}
      return data;
    });
  });
}
var DEV_KEY='bad.clients';
function devRows(){var r=ls.get(DEV_KEY,[]);return Array.isArray(r)?r:[];}
function devSave(list){ls.set(DEV_KEY,list);}
function newId(){try{if(window.crypto&&crypto.randomUUID)return crypto.randomUUID();}catch(e){}return 'd'+Date.now().toString(36)+Math.random().toString(36).slice(2,10);}

function useDevice(){
  mode='device';rows=devRows();
  setStatus('This site has no database connected yet, so clients are saved on this phone only. See the README to connect one.','warn');
}
function forgetPass(){pass='';ls.set('bad.pass','');}

function load(){
  if(location.protocol==='file:'){useDevice();applyMode();return Promise.resolve();}
  return api('GET').then(function(d){
    rows=(d&&d.clients)||[];mode='cloud';lastLoad=Date.now();
    if(statusEl.dataset.kind!=='')setStatus('');
  },function(e){
    if(e.code==='no_database'){useDevice();return;}
    if(e.status===401){
      var hadPass=!!pass;forgetPass();mode='locked';rows=[];setStatus('');
      var le=$('#lock-err');le.textContent='That passcode didn’t work. Check it and try again.';le.hidden=!hadPass;
      return;
    }
    if(e.code==='no_passcode'){mode='setup';rows=[];setStatus(e.message,'warn');return;}
    if(mode!=='cloud'){mode='error';rows=[];}
    setStatus('Couldn’t load the client list. Check the internet connection, then tap Refresh.','crit');
  }).then(applyMode);
}

function writeErr(e){
  if(e&&e.status===401){forgetPass();mode='locked';rows=[];applyMode();return 'The passcode has changed. Enter the new one.';}
  return (e&&e.status&&e.message)||'Couldn’t save. Check the internet connection and try again.';
}
function stamp(r,data){var now=new Date().toISOString();var n=Object.assign({},r,data,{updatedAt:now});if(data.renewed)n.renewedAt=now;delete n.renewed;return n;}
function persistCreate(data){
  if(mode==='cloud')return api('POST',{body:data}).then(function(d){rows.push(d.client);});
  var list=devRows();list.push(stamp({id:newId(),createdAt:new Date().toISOString()},data));devSave(list);rows=list;return Promise.resolve();
}
function persistUpdate(id,data){
  if(mode==='cloud')return api('PUT',{id:id,body:data}).then(function(d){rows=rows.map(function(r){return r.id===id?d.client:r;});});
  var list=devRows().map(function(r){return r.id===id?stamp(r,data):r;});devSave(list);rows=list;return Promise.resolve();
}
function persistDelete(id){
  var drop=function(){rows=rows.filter(function(r){return r.id!==id;});};
  if(mode==='cloud')return api('DELETE',{id:id}).then(drop,function(e){if(e.status===404){drop();return;}throw e;});
  devSave(devRows().filter(function(r){return r.id!==id;}));drop();return Promise.resolve();
}

/* ---------- Render ---------- */
function applyMode(){
  var editable=canEdit();
  $('#cl-add').hidden=!editable;
  if(!editable)form.hidden=true;
  $('#lock-form').hidden=mode!=='locked';
  $('#cl-csv').hidden=!(editable&&rows.length);
  $('#cl-refresh').hidden=!(mode==='cloud'||mode==='error');
  $('#cl-lock').hidden=mode!=='cloud';
  $('#cl-where').textContent=mode==='cloud'?'Saved online. Anyone with the passcode can see and change this list.':
    mode==='device'?'Saved in this browser only. Clearing browser data deletes it, so download a backup now and then.':'';
  var d=mode==='cloud'?devRows():[];
  $('#cl-migrate-text').textContent=d.length+(d.length===1?' client was':' clients were')+' saved on this phone before the database was connected.';
  $('#cl-migrate').hidden=!d.length;
  renderClients();
}

function renderClients(){
  $('#cl-sign').hidden=!!(meName.value.trim()&&mePhone.value.trim());
  var show=canEdit();
  var active=rows.filter(function(r){return r.stage!=='Lost';});
  var over=active.filter(function(r){var d=daysLeft(r.expiry);return d!=null&&d<0&&d>=-90;}).length;
  var due=active.filter(function(r){var d=daysLeft(r.expiry);return d!=null&&d>=0&&d<=30;}).length;
  var cust=rows.filter(function(r){return r.stage==='Customer';});
  var prem=cust.reduce(function(s,r){return s+(Number(r.premium)||0);},0);
  $('#s-over').textContent=show?over:'–';$('#s-due').textContent=show?due:'–';
  $('#s-leads').textContent=show?rows.filter(isLead).length:'–';$('#s-cust').textContent=show?cust.length:'–';
  $('#s-prem').textContent=show?inr(prem):'–';

  var ul=$('#cl-list');
  if(mode==='loading'){ul.innerHTML='<li class="empty"><p class="muted">Loading clients…</p></li>';return;}
  if(!show){ul.innerHTML='';return;}

  var list=rows.slice();
  if(filter==='due')list=list.filter(function(r){if(r.stage==='Lost')return false;var d=daysLeft(r.expiry);return d!=null&&d<=45&&d>=-90;});
  else if(filter==='leads')list=list.filter(isLead);
  else if(filter==='customers')list=list.filter(function(r){return r.stage==='Customer';});
  if(query){var q=query.toLowerCase();list=list.filter(function(r){return [r.name,r.phone,r.detail,r.notes,r.type].some(function(x){return String(x||'').toLowerCase().indexOf(q)>=0;});});}
  function key(r){if(r.stage==='Lost')return 3e9;var d=daysLeft(r.expiry);if(d==null)return 2e9;if(d< -90)return 1e9-d;return d;}
  list.sort(function(a,b){var ka=key(a),kb=key(b);if(ka!==kb)return ka-kb;return String(a.name||'').localeCompare(String(b.name||''));});

  if(!rows.length){
    ul.innerHTML='<li class="empty"><h3>No clients yet</h3><p class="muted">Add the first person from the list of 100: name, phone, what they have (car, bike, health…) and when it renews. The list sorts itself so the next renewal is always on top, and each row gets a one-tap WhatsApp reminder.</p><button type="button" class="btn" data-act="add-first">Add first client</button></li>';
    return;
  }
  if(!list.length){ul.innerHTML='<li class="empty"><p class="muted">Nobody matches this filter.</p></li>';return;}
  ul.innerHTML=list.map(function(r){
    var t=typeOf(r),d=daysLeft(r.expiry),num=waNum(r.phone);
    var meta=[];
    if(r.detail)meta.push(esc(r.detail));
    if(r.phone)meta.push('<span class="ph">'+esc(r.phone)+'</span>');
    if(Number(r.premium))meta.push(inr(Number(r.premium))+'/yr');
    if(r.source)meta.push('via '+esc(r.source));
    var stageCls=r.stage==='Customer'?'stage customer':'stage';
    var acts='';
    if(num&&r.stage!=='Lost'){
      var text=r.expiry?reminderText(r):fill(TPL[0][lang],{name:r.name,me:meName.value,phone:mePhone.value},false);
      acts+='<a class="btn sm" target="_blank" rel="noopener" href="https://wa.me/'+num+'?text='+encodeURIComponent(text)+'">'+(r.expiry?'WhatsApp reminder':'WhatsApp intro')+'</a>';
    }
    if(num)acts+='<a class="btn sm quiet" href="tel:+'+num+'">Call</a>';
    if(r.expiry&&r.stage!=='Lost')acts+='<button type="button" class="btn sm ghost" data-act="renew">Renewed, +1 year</button>';
    acts+='<button type="button" class="btn sm quiet" data-act="edit">Edit</button>';
    acts+='<button type="button" class="btn sm danger" data-act="del">Delete</button>';
    return '<li class="client'+(r.stage==='Lost'?' lost':'')+'" data-id="'+esc(r.id)+'">'+
      '<div class="c-main"><div class="c-name">'+esc(r.name||'(no name)')+' <span class="chip">'+esc(t.v)+'</span> <span class="'+stageCls+'">'+esc(r.stage||'Lead')+'</span></div>'+
      (meta.length?'<div class="c-meta">'+meta.join(' · ')+'</div>':'')+
      (r.notes?'<div class="c-notes">'+esc(r.notes)+'</div>':'')+'</div>'+
      '<div class="c-due">'+pillFor(d)+(r.expiry?'<span class="c-date">Expires '+esc(fmtDate(r.expiry))+'</span>':'<span class="c-date">No expiry date yet</span>')+'</div>'+
      '<div class="c-actions">'+acts+'</div></li>';
  }).join('');
}

/* ---------- Add / edit form ---------- */
var form=$('#cl-form'),formErr=$('#cl-form-err');
function openForm(r){
  editingId=r?r.id:null;
  $('#cl-form-title').textContent=r?'Edit '+(r.name||'client'):'Add client';
  $('#f-name').value=r&&r.name||'';$('#f-phone').value=r&&r.phone||'';
  $('#f-type').value=r&&r.type||'Car';$('#f-detail').value=r&&r.detail||'';
  $('#f-expiry').value=r&&r.expiry||'';$('#f-premium').value=r&&r.premium!=null?r.premium:'';
  $('#f-stage').value=r&&r.stage||'Lead';$('#f-source').value=r&&r.source||'Family';
  $('#f-notes').value=r&&r.notes||'';
  formErr.hidden=true;form.hidden=false;form.scrollIntoView({block:'start',behavior:'smooth'});$('#f-name').focus({preventScroll:true});
}
function closeForm(){form.hidden=true;editingId=null;}
$('#cl-add').addEventListener('click',function(){openForm(null);});
$('#cl-cancel').addEventListener('click',closeForm);
form.addEventListener('submit',function(e){
  e.preventDefault();
  if(!canEdit())return;
  var name=$('#f-name').value.trim();
  if(!name){formErr.textContent='Add a name first.';formErr.hidden=false;$('#f-name').focus();return;}
  var prem=$('#f-premium').value;
  var data={name:name,phone:$('#f-phone').value.trim(),type:$('#f-type').value,detail:$('#f-detail').value.trim(),
    expiry:$('#f-expiry').value||'',premium:prem===''?null:Number(prem),stage:$('#f-stage').value,source:$('#f-source').value,
    notes:$('#f-notes').value.trim()};
  var btn=$('#cl-save');btn.disabled=true;btn.textContent='Saving…';
  (editingId?persistUpdate(editingId,data):persistCreate(data)).then(function(){
    btn.disabled=false;btn.textContent='Save';closeForm();applyMode();
  },function(err){
    btn.disabled=false;btn.textContent='Save';formErr.textContent=writeErr(err);formErr.hidden=false;
  });
});

/* ---------- Row actions ---------- */
var delTimers={};
$('#cl-list').addEventListener('click',function(e){
  var b=e.target.closest('[data-act]');if(!b)return;
  var act=b.dataset.act;
  if(act==='add-first'){openForm(null);return;}
  var li=b.closest('.client');if(!li||!canEdit())return;
  var id=li.dataset.id;var r=rows.filter(function(x){return x.id===id;})[0];if(!r)return;
  if(act==='edit'){openForm(r);return;}
  if(act==='renew'){
    var t=parseISO(r.expiry);if(!t)return;
    var data=pick(r);data.expiry=toISO(new Date(t.getFullYear()+1,t.getMonth(),t.getDate()));data.stage='Customer';data.renewed=true;
    b.disabled=true;b.textContent='Saving…';
    persistUpdate(id,data).then(applyMode,function(err){setStatus(writeErr(err),'crit');b.disabled=false;b.textContent='Renewed, +1 year';});
    return;
  }
  if(act==='del'){
    if(b.dataset.confirm!=='1'){
      b.dataset.confirm='1';b.textContent='Tap again to delete';
      clearTimeout(delTimers[id]);delTimers[id]=setTimeout(function(){if(b.isConnected){b.dataset.confirm='';b.textContent='Delete';}},4000);
      return;
    }
    b.disabled=true;b.textContent='Deleting…';
    persistDelete(id).then(applyMode,function(err){setStatus(writeErr(err),'crit');b.disabled=false;b.textContent='Delete';b.dataset.confirm='';});
  }
});

/* ---------- Filters, search, passcode, backup ---------- */
$$('.filters button').forEach(function(b){b.addEventListener('click',function(){filter=b.dataset.filter;$$('.filters button').forEach(function(x){x.setAttribute('aria-pressed',String(x===b));});renderClients();});});
var sTimer;$('#cl-search').addEventListener('input',function(e){clearTimeout(sTimer);var v=e.target.value;sTimer=setTimeout(function(){query=v.trim();renderClients();},150);});

$('#lock-form').addEventListener('submit',function(e){
  e.preventDefault();
  var v=$('#lock-pass').value;var le=$('#lock-err');
  if(!v){le.textContent='Type the passcode first.';le.hidden=false;return;}
  pass=v;ls.set('bad.pass',v);le.hidden=true;
  var b=$('#lock-go');b.disabled=true;b.textContent='Checking…';
  load().then(function(){b.disabled=false;b.textContent='Open client list';if(mode==='cloud')$('#lock-pass').value='';});
});
$('#cl-lock').addEventListener('click',function(){forgetPass();rows=[];mode='locked';closeForm();setStatus('');$('#lock-err').hidden=true;applyMode();});
$('#cl-refresh').addEventListener('click',function(){var b=this;b.disabled=true;load().then(function(){b.disabled=false;});});
document.addEventListener('visibilitychange',function(){if(document.visibilityState==='visible'&&mode==='cloud'&&Date.now()-lastLoad>30000)load();});

$('#cl-migrate-go').addEventListener('click',function(){
  var b=this,list=devRows(),i=0,failed=[];if(!list.length||mode!=='cloud')return;
  b.disabled=true;
  (function next(){
    if(i>=list.length){
      devSave(failed);b.disabled=false;b.textContent='Upload them';
      if(failed.length)setStatus(failed.length+' couldn’t be uploaded. Tap "Upload them" to try again.','crit');else setStatus('Uploaded. Everything is now saved online.','');
      applyMode();return;
    }
    var r=list[i++];b.textContent='Uploading '+i+' of '+list.length+'…';
    var data=pick(r);
    api('POST',{body:data}).then(function(d){rows.push(d.client);},function(){failed.push(r);}).then(next);
  })();
});

$('#cl-csv').addEventListener('click',function(){
  var cols=['name','phone','type','detail','expiry','premium','stage','source','notes','createdAt','updatedAt','renewedAt'];
  function q(v){v=v==null?'':String(v);if(/^[=+\-@]/.test(v))v="'"+v;return '"'+v.replace(/"/g,'""')+'"';}
  var csv=[cols.join(',')].concat(rows.map(function(r){return cols.map(function(c){return q(r[c]);}).join(',');})).join('\r\n');
  var a=document.createElement('a');a.href=URL.createObjectURL(new Blob(['﻿'+csv],{type:'text/csv;charset=utf-8'}));
  a.download='clients-'+toISO(new Date())+'.csv';document.body.appendChild(a);a.click();
  setTimeout(function(){URL.revokeObjectURL(a.href);a.remove();},1000);
});

applyMode();
load();
})();
