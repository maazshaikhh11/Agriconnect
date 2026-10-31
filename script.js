
const CROPS = [
  {n:'Wheat',        p:2425},
  {n:'Soybean',      p:4892},
  {n:'Cotton',       p:7121},
  {n:'Tur (arhar)',  p:7550},
  {n:'Onion',        p:1640},
  {n:'Maize',        p:2180}
];
const CHAIN_COST = 0.08;   /* illustrative share lost to middlemen and handling */
const PLATFORM_FEE = 0.02; /* illustrative Agri-Connect fee */

const fmt = n => '₹' + Math.round(n).toLocaleString('en-IN');
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;


document.getElementById('today').textContent =
  new Date().toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'});
document.getElementById('yr').textContent = new Date().getFullYear();


const state = CROPS.map(c => ({...c, base:c.p}));
const tbody = document.getElementById('rows');
tbody.innerHTML = state.map((c,i)=>`
  <tr><td>${c.n}</td>
  <td><span class="price" id="p${i}">${c.p.toLocaleString('en-IN')}</span></td>
  <td><span class="chg" id="c${i}">0.0%</span></td></tr>`).join('');

function paint(i, dir){
  const c = state[i], pe = document.getElementById('p'+i), ce = document.getElementById('c'+i);
  pe.textContent = Math.round(c.p).toLocaleString('en-IN');
  const pct = (c.p - c.base) / c.base * 100;
  ce.textContent = (pct >= 0 ? '▲ ' : '▼ ') + Math.abs(pct).toFixed(1) + '%';
  ce.className = 'chg ' + (pct >= 0 ? 'up' : 'down');
  if(dir){
    pe.className = 'price ' + dir;
    setTimeout(()=>pe.className='price', 900);
  }
}
state.forEach((_,i)=>paint(i));
if(!reduce){
  setInterval(()=>{
    const i = Math.floor(Math.random()*state.length);
    const move = (Math.random()*1.0 + 0.1) / 100;
    const dir = Math.random() > .48 ? 'up' : 'down';
    state[i].p *= dir === 'up' ? 1 + move : 1 - move;
    paint(i, dir);
  }, 2200);
}


const cropSel = document.getElementById('crop');
const qty = document.getElementById('qty');
cropSel.innerHTML = CROPS.map((c,i)=>`<option value="${i}">${c.n}</option>`).join('');
document.getElementById('assume').textContent =
  `Illustrative only: assumes ${CHAIN_COST*100}% goes to middlemen and handling in the market chain, and a ${PLATFORM_FEE*100}% platform fee on Agri-Connect. Prices use the sample rates above.`;

let shown = {old:0, nu:0};
function tween(id, key, to){
  const el = document.getElementById(id);
  if(reduce){ el.textContent = fmt(to); shown[key] = to; return; }
  const from = shown[key], t0 = performance.now(), dur = 450;
  (function step(t){
    const k = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - k, 3);
    el.textContent = fmt(from + (to - from) * e);
    if(k < 1) requestAnimationFrame(step); else shown[key] = to;
  })(t0);
}
function calc(){
  const price = CROPS[cropSel.value].p, q = +qty.value;
  const gross = price * q;
  const oldNet = gross * (1 - CHAIN_COST), newNet = gross * (1 - PLATFORM_FEE);
  document.getElementById('qtyOut').textContent = q;
  tween('oldAmt','old',oldNet);
  tween('newAmt','nu',newNet);
  document.getElementById('gain').textContent = 'You could keep about ' + fmt(newNet - oldNet) + ' more.';
}
cropSel.addEventListener('change', calc);
qty.addEventListener('input', calc);
calc();


const form = document.getElementById('joinForm');
form.addEventListener('submit', e => {
  e.preventDefault();
  const name = document.getElementById('name').value.trim();
  const phone = document.getElementById('phone').value.replace(/\s+/g,'');
  const role = document.getElementById('role').value;
  const nErr = document.getElementById('nameErr'), pErr = document.getElementById('phoneErr');
  const msg = document.getElementById('formMsg');
  nErr.textContent = name.length < 2 ? 'Enter your full name.' : '';
  pErr.textContent = /^[6-9]\d{9}$/.test(phone) ? '' : 'Enter a valid 10-digit mobile number.';
  msg.innerHTML = '';
  if(nErr.textContent || pErr.textContent) return;
  /* TODO: send { name, phone, role } to your backend or a service like Formspree here. */
  msg.innerHTML = `<div class="ok">Thanks, ${name.replace(/[<>&]/g,'')}. We will call you on ${phone} to set up your ${role.toLowerCase()} account.</div>`;
  form.reset();
});


const menuBtn = document.getElementById('menuBtn'), menu = document.getElementById('menu');
menuBtn.addEventListener('click', () => {
  const open = menu.classList.toggle('open');
  menuBtn.setAttribute('aria-expanded', open);
});
menu.addEventListener('click', e => { if(e.target.tagName === 'A'){ menu.classList.remove('open'); menuBtn.setAttribute('aria-expanded', false); } });