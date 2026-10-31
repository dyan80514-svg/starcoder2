const assets = [
  {id:'BTC',name:'Bitcoin',symbol:'₿',color:'#f59c33',price:67432.80,change:2.84,volume:'28.42B'},
  {id:'ETH',name:'Ethereum',symbol:'♦',color:'#7888cb',price:3521.64,change:1.67,volume:'14.86B'},
  {id:'SOL',name:'Solana',symbol:'≋',color:'#7c55c3',price:172.38,change:5.23,volume:'3.21B'},
  {id:'BNB',name:'BNB',symbol:'⟐',color:'#c9a329',price:598.24,change:-0.82,volume:'1.64B'},
  {id:'XRP',name:'XRP',symbol:'×',color:'#434d51',price:0.5284,change:1.12,volume:'986.42M'},
  {id:'DOGE',name:'Dogecoin',symbol:'Ð',color:'#b5a053',price:0.1642,change:-2.31,volume:'842.18M'},
  {id:'AVAX',name:'Avalanche',symbol:'▲',color:'#cf5259',price:38.72,change:3.46,volume:'412.67M'},
  {id:'LINK',name:'Chainlink',symbol:'⬡',color:'#3763cf',price:17.89,change:2.08,volume:'326.15M'}
];
const icons = {
  grid:'<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  chart:'<path d="M4 4v16h17M8 14l4-5 4 3 5-7"/>',
  wallet:'<path d="M20 8V5H5a2 2 0 0 0 0 4h16v11H5a2 2 0 0 1-2-2V7"/><path d="M21 12h-6v5h6"/><path d="M17 14.5h.01"/>',
  star:'<path d="m12 3 2.8 5.8 6.4.9-4.6 4.5 1.1 6.3-5.7-3-5.7 3 1.1-6.3L2.8 9.7l6.4-.9Z"/>',
  shield:'<path d="M12 3 4 6v6c0 5 8 9 8 9s8-4 8-9V6Z"/><path d="m8.5 12 2.5 2.5 4.5-5"/>',
  globe:'<circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18"/>',
  activity:'<path d="M2 12h5l3-8 4 16 3-8h5"/>',
  info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7h.01"/>',
  exchange:'<path d="M3 7h17l-4-4M21 17H4l4 4"/>',
  search:'<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>'
};
document.querySelectorAll('[data-icon]').forEach(el => {
  el.innerHTML = `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">${icons[el.dataset.icon] || ''}</svg>`;
});
const $ = id => document.getElementById(id);
const money = value => new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',minimumFractionDigits:2,maximumFractionDigits:value > 0 && value < 1 ? 4 : 2}).format(value);
const initialState = () => ({cash:4250,holdings:{BTC:.21,ETH:1.4,SOL:7.2},watchlist:['BTC','ETH','SOL']});
let state = initialState();
try {
  const saved = JSON.parse(localStorage.getItem('nova-demo-v1'));
  if (saved && Number.isFinite(saved.cash) && saved.cash >= 0 && saved.holdings && typeof saved.holdings === 'object' && !Array.isArray(saved.holdings) && Object.values(saved.holdings).every(v => Number.isFinite(v) && v >= 0) && Array.isArray(saved.watchlist)) {
    state = {cash:saved.cash,holdings:saved.holdings,watchlist:saved.watchlist.filter(id => assets.some(a => a.id === id))};
  }
} catch {}
let activeView = 'Overview', filter = 'all', chartAsset = 'BTC', range = '24H', side = 'buy', priceSort = 0, toastTimer;
function notify(message) {
  $('toast').textContent = message;
  $('toast').classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => $('toast').classList.remove('visible'), 3600);
}
function persist() {
  try { localStorage.setItem('nova-demo-v1',JSON.stringify(state)); }
  catch { notify('Browser storage is unavailable. Changes last for this session only.'); }
}
function coin(a, small = false) {
  return `<span class="coin ${small ? 'small-coin' : ''}" style="background:${a.color};color:white" aria-hidden="true">${a.symbol}</span>`;
}
function series(seed, count = 70, falling = false) {
  let n = seed;
  return Array.from({length:count},(_,i) => {
    n = (n * 9301 + 49297) % 233280;
    return 65 - (i / (count - 1)) * (falling ? -25 : 38) + Math.sin(i * .38) * 7 + (n / 233280 - .5) * 13;
  });
}
function spark(a, index) {
  const values = series(index * 173 + 13,32,a.change < 0);
  const points = values.map((y,i) => `${i * 2.8},${(y - 15) * .28}`).join(' ');
  return `<svg class="sparkline" viewBox="0 0 88 28" role="img" aria-label="${a.name} illustrative seven-day trend"><polyline points="${points}" fill="none" stroke="${a.change >= 0 ? '#a6ce8a' : '#c78483'}" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
}
function renderMarkets() {
  const search = $('market-search').value.trim().toLowerCase();
  let visible = assets.filter(a => `${a.name} ${a.id}`.toLowerCase().includes(search));
  if (filter === 'watchlist') visible = visible.filter(a => state.watchlist.includes(a.id));
  if (filter === 'gainers') visible = visible.filter(a => a.change > 0).sort((a,b) => b.change - a.change);
  if (priceSort) visible.sort((a,b) => (a.price-b.price)*priceSort);
  $('market-body').innerHTML = visible.map(a => {
    const index = assets.indexOf(a), saved = state.watchlist.includes(a.id);
    return `<tr><td><button class="star-button ${saved?'saved':''}" data-star="${a.id}" aria-label="${saved?'Remove':'Add'} ${a.name} ${saved?'from':'to'} watchlist" aria-pressed="${saved}">${saved?'★':'☆'}</button></td><td>${index+1}</td><td><div class="table-asset">${coin(a)}<div><div class="asset-name">${a.name}</div><div class="asset-symbol">${a.id}</div></div></div></td><td>${money(a.price)}</td><td class="${a.change>=0?'positive':'negative'}">${a.change>=0?'↗ +':'↘ '}${a.change.toFixed(2)}%</td><td class="volume-column">$${a.volume}</td><td>${spark(a,index)}</td><td class="action-column"><button class="table-trade" data-trade="${a.id}" aria-label="Trade ${a.name}">Trade ↗</button></td></tr>`;
  }).join('');
  $('empty-state').hidden = visible.length !== 0;
  $('asset-count').textContent = `Showing ${visible.length} ${visible.length === 1 ? 'asset' : 'assets'}`;
}
function renderChart() {
  const a = assets.find(a => a.id === chartAsset);
  $('chart-coin').textContent = a.symbol;
  $('chart-coin').style.background = a.color;
  $('chart-pair').textContent = `${a.id} / USD`;
  $('chart-price').textContent = money(a.price);
  const multiplier = {'1H':.17,'24H':1,'1W':2.4,'1M':3.8,'1Y':12,'ALL':24}[range];
  const change = a.change * multiplier;
  $('chart-change').textContent = `${change >= 0?'↗ +':'↘ '}${change.toFixed(2)}%`;
  $('chart-change').className = `chart-change ${change>=0?'positive':'negative'}`;
  const values = series(assets.indexOf(a)*173 + range.length * 81 + range.charCodeAt(0),90,change<0);
  const W = 620, H = 205, plotW = 550;
  const points = values.map((v,i) => [i/(values.length-1)*plotW, 22+(v-10)*1.6]);
  const line = points.map((p,i) => `${i?'L':'M'}${p[0].toFixed(2)},${p[1].toFixed(2)}`).join(' ');
  const last = points[points.length-1];
  const labels = {
    '1H':['10:00','10:10','10:20','10:30','10:40','11:00'],
    '24H':['00:00','04:00','08:00','12:00','16:00','20:00'],
    '1W':['Mon','Tue','Wed','Thu','Fri','Sun'],
    '1M':['Jun 1','Jun 6','Jun 12','Jun 18','Jun 24','Jun 30'],
    '1Y':['Jan','Mar','May','Jul','Sep','Dec'],
    'ALL':['2020','2021','2022','2023','2024','2025']
  }[range];
  const color = change >= 0 ? '#bde982' : '#e39595';
  let grid = '';
  for(let i=0;i<4;i++) {
    const y = 25+i*46;
    const price = a.price*(1.045-i*.025*multiplier**.3);
    grid += `<line x1="0" y1="${y}" x2="${plotW}" y2="${y}" stroke="#2a3227" stroke-dasharray="3 5"/><text x="567" y="${y+3}" fill="#7f8d77" font-size="9">${price.toLocaleString('en-US',{maximumFractionDigits:a.price<1?3:0})}</text>`;
  }
  $('chart-container').innerHTML = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${a.name} simulated ${range} price chart">
    <defs><linearGradient id="chart-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="${color}" stop-opacity=".15"/><stop offset="100%" stop-color="${color}" stop-opacity="0"/></linearGradient></defs>
    ${grid}<path d="${line} L${plotW},181 L0,181 Z" fill="url(#chart-fill)"/>
    <path d="${line}" fill="none" stroke="${color}" stroke-width="2" stroke-linejoin="round"/>
    <line x1="${last[0]}" y1="9" x2="${last[0]}" y2="181" stroke="#526044" stroke-dasharray="3 4"/>
    <circle cx="${last[0]}" cy="${last[1]}" r="5" fill="${color}" fill-opacity=".2"/><circle cx="${last[0]}" cy="${last[1]}" r="2.8" fill="${color}"/>
    ${labels.map((l,i) => `<text x="${i*plotW/5}" y="201" text-anchor="${i===0?'start':i===5?'end':'middle'}" fill="#7f8d77" font-size="9">${l}</text>`).join('')}
  </svg>`;
}
function updateAccount() {
  const total = state.cash + assets.reduce((sum,a) => sum+(state.holdings[a.id]||0)*a.price,0);
  $('portfolio-value').textContent = money(total);
  $('available-cash').textContent = money(state.cash);
  const held = assets.filter(a => (state.holdings[a.id]||0)>1e-10);
  $('holdings-list').innerHTML = held.map(a => `<div class="holding-row"><div class="table-asset">${coin(a)}<div>${a.name}<small>${state.holdings[a.id].toFixed(8)} ${a.id}</small></div></div><div>${money(state.holdings[a.id]*a.price)}<small>Demo holding</small></div></div>`).join('') + `<div class="holding-row"><div>Available cash<small>Demo USD balance</small></div><strong>${money(state.cash)}</strong></div>`;
  updateEstimate();
}
function updateEstimate() {
  const a = assets.find(a => a.id === $('trade-asset').value);
  const amount = Number($('trade-amount').value);
  $('trade-coin').textContent = a.symbol;
  $('trade-coin').style.background = a.color;
  $('estimate-label').textContent = side === 'buy' ? 'You receive' : 'You sell';
  $('trade-estimate').textContent = `${(Number.isFinite(amount)&&amount>0 ? amount/a.price : 0).toFixed(8)} ${a.id}`;
  $('trade-submit').innerHTML = `Preview ${side} <span>↗</span>`;
}
function setFilter(next) {
  filter = next;
  document.querySelectorAll('[data-filter]').forEach(b => {b.classList.toggle('selected',b.dataset.filter===next);b.setAttribute('aria-pressed',String(b.dataset.filter===next));});
  renderMarkets();
}
function setView(view) {
  activeView = view;
  $('breadcrumb-view').textContent = view;
  document.querySelectorAll('[data-view]').forEach(b => {b.classList.toggle('active',b.dataset.view===view);b.setAttribute('aria-current',b.dataset.view===view?'page':'false');});
  const copy = {
    Overview:['Your crypto, in focus.','A clearer view of the market. A smarter way to move.'],
    Markets:['A world of opportunity.','Explore assets and discover what’s moving the market.'],
    Portfolio:['Your next chapter.','Keep your demo holdings and available balance in view.'],
    Watchlist:['Keep your favorites close.','Your saved assets, all in one place.']
  }[view];
  $('page-title').textContent = copy[0];
  $('page-description').textContent = copy[1];
  $('trading-section').hidden = view === 'Watchlist' || view === 'Portfolio';
  $('holdings-section').hidden = view !== 'Portfolio';
  $('markets-section').hidden = view === 'Portfolio';
  $('market-title').textContent = view === 'Watchlist' ? 'Your watchlist' : 'Market overview';
  $('market-subtitle').textContent = view === 'Watchlist' ? 'A little more focus on the assets you follow.' : 'Find your next opportunity.';
  setFilter(view==='Watchlist'?'watchlist':'all');
}
function showModal(title,html,actions=[]) {
  $('modal-title').textContent = title;
  $('modal-content').innerHTML = html;
  $('modal-actions').replaceChildren();
  actions.forEach(action => {
    const b = document.createElement('button');
    b.className = `button ${action.secondary?'secondary':'primary'}`;
    b.textContent = action.label;
    b.addEventListener('click',action.run);
    $('modal-actions').append(b);
  });
  if (!$('modal').open) $('modal').showModal();
}
function closeModal() { $('modal').close(); }
$('close-modal').addEventListener('click',closeModal);
$('modal').addEventListener('click',e => {if(e.target===$('modal')) {const r=$('modal').getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeModal();}});
const options = assets.map(a => `<option value="${a.id}">${a.name} (${a.id})</option>`).join('');
$('trade-asset').innerHTML = options;
$('chart-asset').innerHTML = assets.map(a => `<option value="${a.id}">${a.name}</option>`).join('');
document.querySelectorAll('[data-view]').forEach(b => b.addEventListener('click',() => setView(b.dataset.view)));
document.querySelectorAll('[data-filter]').forEach(b => b.addEventListener('click',() => setFilter(b.dataset.filter)));
document.querySelectorAll('[data-range]').forEach(b => b.addEventListener('click',() => {
  range=b.dataset.range;
  document.querySelectorAll('[data-range]').forEach(el => {el.classList.toggle('selected',el===b);el.setAttribute('aria-pressed',String(el===b));});
  renderChart();
}));
document.querySelectorAll('[data-side]').forEach(b => b.addEventListener('click',() => {
  side=b.dataset.side;
  document.querySelectorAll('[data-side]').forEach(el => {el.classList.toggle('selected',el===b);el.setAttribute('aria-pressed',String(el===b));});
  updateEstimate();
}));
$('chart-asset').addEventListener('change',e => {chartAsset=e.target.value;renderChart();});
$('trade-asset').addEventListener('change',updateEstimate);
$('trade-amount').addEventListener('input',updateEstimate);
document.querySelectorAll('[data-amount]').forEach(b => b.addEventListener('click',() => {$('trade-amount').value=b.dataset.amount;updateEstimate();}));
$('max-amount').addEventListener('click',() => {
  const a=assets.find(a=>a.id===$('trade-asset').value);
  const max=side==='buy'?state.cash:(state.holdings[a.id]||0)*a.price;
  $('trade-amount').value=(Math.floor(max*100)/100).toFixed(2);
  updateEstimate();
});
$('market-search').addEventListener('input',renderMarkets);
$('sort-price').addEventListener('click',() => {priceSort=priceSort===1?-1:1;$('sort-price').innerHTML=`Price <span>${priceSort===1?'↑':'↓'}</span>`;$('sort-price').closest('th').setAttribute('aria-sort',priceSort===1?'ascending':'descending');renderMarkets();});
$('market-body').addEventListener('click',e => {
  const star=e.target.closest('[data-star]');
  if(star) {
    const id=star.dataset.star, exists=state.watchlist.includes(id);
    state.watchlist=exists?state.watchlist.filter(s=>s!==id):[...state.watchlist,id];
    persist();renderMarkets();
    document.querySelector(`[data-star="${id}"]`)?.focus();
    notify(`${id} ${exists?'removed from':'added to'} your watchlist`);
  }
  const trade=e.target.closest('[data-trade]');
  if(trade) {
    const id=trade.dataset.trade;
    if(activeView==='Watchlist')setView('Overview');
    $('trade-asset').value=id;$('chart-asset').value=id;chartAsset=id;
    updateEstimate();renderChart();
    $('trade-amount').focus();
    $('trading-section').scrollIntoView({behavior:'smooth',block:'center'});
  }
});
$('trade-form').addEventListener('submit',e => {
  e.preventDefault();
  const amount=Number($('trade-amount').value), a=assets.find(a=>a.id===$('trade-asset').value), orderSide=side;
  if(!Number.isFinite(amount)||amount<1) {notify('Enter an amount of at least $1.00.');return;}
  const quantity=amount/a.price;
  function valid() {
    if(orderSide==='buy' && amount>state.cash+1e-8) {notify('Insufficient demo cash. Add funds or reduce the amount.');return false;}
    if(orderSide==='sell' && quantity>(state.holdings[a.id]||0)+1e-12) {notify(`Not enough ${a.id}. You hold ${(state.holdings[a.id]||0).toFixed(8)} ${a.id}.`);return false;}
    return true;
  }
  if(!valid()) return;
  showModal(`Review your ${orderSide}`,`<p>This is a simulated order. No real funds or crypto will move.</p><div class="order-line"><span>Asset</span><strong>${a.name}</strong></div><div class="order-line"><span>Quantity</span><strong>${quantity.toFixed(8)} ${a.id}</strong></div><div class="order-line"><span>Price per coin</span><strong>${money(a.price)}</strong></div><div class="order-line"><span>${orderSide==='buy'?'Total cost':'You receive'}</span><strong>${money(amount)}</strong></div>`,[
    {label:'Cancel',secondary:true,run:closeModal},
    {label:`Confirm demo ${orderSide}`,run:() => {
      if(!valid()) {closeModal();return;}
      if(orderSide==='buy') {state.cash=Math.max(0,state.cash-amount);state.holdings[a.id]=(state.holdings[a.id]||0)+quantity;}
      else {state.cash+=amount;state.holdings[a.id]=Math.max(0,(state.holdings[a.id]||0)-quantity);}
      persist();updateAccount();closeModal();$('trade-amount').value='';updateEstimate();notify(`Demo ${orderSide} complete: ${quantity.toFixed(6)} ${a.id}`);
    }}
  ]);
});
$('add-funds').addEventListener('click',() => showModal('Room to explore.', '<p>Add <strong>$5,000 in virtual USD</strong> to your demo balance. Practice trading without connecting a wallet or using real money.</p>',[
  {label:'Cancel',secondary:true,run:closeModal},
  {label:'Add $5,000 demo funds',run:() => {state.cash+=5000;persist();updateAccount();closeModal();notify('$5,000 added to your demo balance');}}
]));
$('info-button').addEventListener('click',() => showModal('A sandbox, not an exchange.', '<p>Nova is an interactive crypto dashboard demo. All prices, market statistics, sentiment scores, and charts are illustrative—not live market feeds.</p><p>Buy and sell actions change only your browser’s virtual portfolio. There is no wallet connection, backend, or real transaction. Nothing here is financial advice.</p>',[{label:'Got it',run:closeModal}]));
$('learn-button').addEventListener('click',() => showModal('Start with the basics.', '<p><strong>What is crypto?</strong><br>Digital assets recorded on distributed networks. Different networks have different uses and risks.</p><p><strong>Read the market.</strong><br>Price shows the cost of one coin. Volume measures trading activity. A positive 24h change does not predict future returns.</p><p><strong>Protect your downside.</strong><br>Crypto prices can move sharply. Never share recovery phrases, and only risk what you can afford to lose. Practice here with virtual funds first.</p>',[{label:'Back to exploring',run:closeModal}]));
$('profile-button').addEventListener('click',() => showModal('Your demo workspace', '<p>You’re exploring as <strong>Jamie Davis</strong>. Your virtual balances and watchlist are saved in this browser when storage is available.</p><p>Resetting restores the original holdings, $4,250 cash balance, and default watchlist.</p>',[
  {label:'Close',secondary:true,run:closeModal},
  {label:'Reset demo',run:() => showModal('Reset your workspace?', '<p>Your simulated trades and saved watchlist will be cleared. This cannot be undone.</p>',[
    {label:'Cancel',secondary:true,run:closeModal},
    {label:'Confirm reset',run:() => {state=initialState();persist();updateAccount();renderMarkets();closeModal();notify('Demo workspace reset');}}
  ])}
]));
document.addEventListener('keydown',e => {
  if(e.key==='/' && !['INPUT','SELECT','TEXTAREA'].includes(document.activeElement.tagName) && !$('modal').open) {
    e.preventDefault();if(activeView==='Portfolio')setView('Markets');$('market-search').focus();
  }
});
renderChart();
renderMarkets();
updateAccount();
document.querySelectorAll('[data-range],[data-side],[data-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b.classList.contains('selected'))));
