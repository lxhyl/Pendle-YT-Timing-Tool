'use strict';

/* ==== Plotly 预载 ==== */
const PLOTLY_SRC = '/vendor/plotly-2.35.2.min.js';
async function ensurePlotly(){
  if (window.Plotly) return;

  await new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = PLOTLY_SRC;      
    s.async = false;         
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('Failed to load ' + PLOTLY_SRC));
    document.head.appendChild(s);
  });

  const t0 = Date.now();
  while (!window.Plotly && Date.now() - t0 < 1000) {
    await new Promise(r => setTimeout(r, 20));
  }

  if (!window.Plotly) {
    throw new Error('Plotly loaded but window.Plotly is still undefined (after wait)');
  }
}


document.addEventListener('DOMContentLoaded', () => {
  ensurePlotly()
    .then(()=>console.log('[boot] Plotly ready:', typeof Plotly))
    .catch(e=>console.error('[boot] ensurePlotly failed:', e));
});

/* ========= i18n ========= */
const I18N = {
  zh: {
    title: "Pendle YT 择时工具 · 网页版",
    plotly: "Plotly",
    standalone: "安全无后端 · 直连 API",
    toggleTheme: "深/浅色",
    run: "运行",
    network: "区块链网络",
    market: "Market Contract",
    yt: "YT Contract",
    underlying: "底层资产数量",
    pointsPerDay: "每个基础资产每天可获得的积分数量",
    multiplier: "Pendle平台的积分倍数",
    loading: "拉取与计算中…",
    symbol: "所查询市场",
    maturity: "到期时间 (UTC)",
    wImplied: "加权后 Implied APY",
    txnUnique: "交易笔数 (unique)",
    weightedImpliedKV: "加权 Implied APY（交易量加权）",
    buyNowPoints: "Points（现在买入可获得的积分数量）",
    networkHelp: "选择市场所在区块链",
    marketHelp: "Pendle Market 的合约地址，可从 Pendle 每个市场的Specs中获取",
    ytHelp: "YT Token 的合约地址，可从 Pendle 每个市场的Specs中获取",
    underlyingHelp: "您计划投入的基础资产数量（如 kHYPE、USDe 等）",
    pointsHelp: "每个基础资产每天可获得的积分数量，请参考项目方文档（如Falcon是每个sUSDe每天 1 积分）",
    multiplierHelp: "Pendle 的积分倍数加成，通常在积分活动期间Pendle会有额外加成（如Falcon sUSDf 积分倍数36）",
    chartTitle: (s, n, u) => `${s} 在 ${n} [${u} 底层资产]`,
    chartY1: "YT价格",
    chartY2: "该时刻购买，到期获得的积分数量",
    chartXAxis: "时间",
    switchLanguage: "切换语言",
    errNotFound: "未找到匹配的 YT 资产或到期信息，请检查合约地址与网络。",
    errExpiry: (v) => `无法解析到期时间：${v}`
  },
  en: {
    title: "Pendle YT Timing Tool · Web Version",
    plotly: "Plotly",
    standalone: "No Backend · Direct API Connection",
    toggleTheme: "Dark/Light Theme",
    run: "Run",
    network: "Network",
    market: "Market Contract",
    yt: "YT Contract",
    underlying: "Underlying Amount",
    pointsPerDay: "Points / Day / Underlying",
    multiplier: "Pendle Multiplier",
    loading: "Fetching and calculating…",
    symbol: "Symbol",
    maturity: "Maturity (UTC)",
    wImplied: "Weighted Implied APY",
    txnUnique: "Transactions (unique)",
    weightedImpliedKV: "Weighted Implied APY (Volume-weighted)",
    buyNowPoints: "Points (Points available now upon purchase)",
    networkHelp: "Select the blockchain of the market",
    marketHelp: "Contract address of the Pendle Market, available from the Specs of each market",
    ytHelp: "Contract address of the YT Token, available from the Specs of each market",
    underlyingHelp: "The amount of the underlying asset you plan to invest (e.g., kHYPE, USDe, etc.)",
    pointsHelp: "The number of points earned per underlying asset per day. Please refer to the project's documentation (e.g., Falcon provides 1 point per sUSDe per day)",
    multiplierHelp: "Pendle’s points multiplier bonus, typically with additional boosts during special events (e.g., Falcon sUSDf has a points multiplier of 36)",
    chartTitle: (s, n, u) => `${s} on ${n} [${u} underlying coin]`,
    chartY1: "YT Price",
    chartY2: "Points earned if bought at this time until maturity",
    chartXAxis: "Time",
    switchLanguage: "Switch language",
    errNotFound: "No matching YT asset/expiry found. Please check YT address and network.",
    errExpiry: (v) => `Failed to parse expiry: ${v}`
  }
};

let LANG = 'en';
function t(key, ...args){ const v = I18N[LANG][key]; return typeof v==='function' ? v(...args) : v; }

function applyLang(){
  const setText = (sel, txt) => { const el = document.querySelector(sel); if (el) el.textContent = txt; };
  setText('#title', t('title'));
  setText('#badge-plotly', t('plotly'));
  setText('#badge-standalone', t('standalone'));
  setText('[data-i18n="toggleTheme"]', t('toggleTheme'));
  setText('[data-i18n="run"]', t('run'));
  setText('#loadingText', t('loading'));

  document.querySelectorAll('[data-i18n]').forEach(el=>{
    const k=el.getAttribute('data-i18n');
    if(['toggleTheme','run'].includes(k)) return;
    el.textContent = t(k);
  });

  const langLabel = document.getElementById('langLabel');
  if (langLabel) langLabel.textContent = (LANG==='en' ? 'EN' : '中文');
  const langBtn = document.getElementById('langToggle');
  if (langBtn){
    langBtn.setAttribute('title', t('switchLanguage'));
    langBtn.setAttribute('aria-label', t('switchLanguage'));
  }

  const dataSrc = document.getElementById('dataSrc');
  if (dataSrc){
    dataSrc.innerHTML = LANG==='zh'
      ? '数据来源：<span class="mono">api-v2.pendle.finance</span> · 仅供研究参考'
      : 'Data source: <span class="mono">api-v2.pendle.finance</span> · For research only';
  }

  document.documentElement.setAttribute('lang', LANG==='en'?'en':'zh');
  relayoutChartTheme();
}

/* ========= 主题 ========= */
function currentTheme(){ return document.documentElement.getAttribute('data-theme') || 'dark'; }
function setTheme(theme){ document.documentElement.setAttribute('data-theme', theme); relayoutChartTheme(); }
function toggleTheme(){ setTheme(currentTheme()==='dark'?'light':'dark'); }
function relayoutChartTheme(){
  if (!window.__plot_inited) return;
  const isDark = currentTheme()==='dark';
  Plotly.relayout('chart', {
    'paper_bgcolor': isDark ? '#0b0f16' : '#ffffff',
    'plot_bgcolor':  isDark ? '#0b0f16' : '#ffffff',
    'font.color':    isDark ? '#e6edf3' : '#0b1220'
  });
  setTimeout(()=>Plotly.Plots.resize('chart'),0);
}

/* ========= 常量 & 小工具 ========= */
const NETWORK_IDS={arbitrum:'42161',ethereum:'1',mantle:'5000',berachain:'80094',base:'8453',hyperevm:'999'};
const NETWORK_PATH={arbitrum:'/42161',ethereum:'/1',mantle:'/5000',berachain:'/80094',base:'/8453',hyperevm:'/999'};
const sleep=(ms)=>new Promise(r=>setTimeout(r,ms));
const fmtPct=(x)=>isFinite(x)?(x*100).toFixed(2)+'%':'-';
const fmtNum=(x)=>isFinite(x)?(Math.round((x+Number.EPSILON)*100)/100).toLocaleString():'-';
function addClass(id, cls){ const el=document.getElementById(id); if (el) el.classList.add(cls); }
function rmClass(id, cls){ const el=document.getElementById(id); if (el) el.classList.remove(cls); }
function setLoading(on){ const id='status'; on?rmClass(id,'hidden'):addClass(id,'hidden'); }
function showError(msg){ const el=document.getElementById('errmsg'); if (el) el.textContent=msg||'Unknown error'; rmClass('error','hidden'); }
function hideError(){ addClass('error','hidden'); }

function parseExpiry(raw){
  if (raw == null) return new Date(NaN);
  if (typeof raw === 'number') return new Date(raw > 1e12 ? raw : raw*1000);
  const s=String(raw).trim();
  if (/^\d+$/.test(s)){ const n=Number(s); return new Date(n>1e12?n:n*1000); }
  const iso=/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/.test(s) ? s.replace(' ','T') : s;
  return new Date(iso);
}

/* 输入校验与边界限制 */
function isAddress(s){ return /^0x[a-fA-F0-9]{40}$/.test(String(s||'')); }
function clamp(n, min, max){ n = Number(n); return isFinite(n) ? Math.min(max, Math.max(min, n)) : min; }
function sanitizeInputs(){
  const network = document.getElementById('network').value.trim();
  const market  = document.getElementById('market_contract').value.trim().toLowerCase();
  const yt      = document.getElementById('yt_contract').value.trim().toLowerCase();
  const allowedNetworks = ['ethereum','arbitrum','mantle','berachain','base','hyperevm'];
  if (!allowedNetworks.includes(network)) throw new Error('Invalid network');
  if (!isAddress(market)) throw new Error('Invalid market address');
  if (!isAddress(yt)) throw new Error('Invalid YT address');

  let underlying = clamp(document.getElementById('underlying_amount').value, 0, 1e9);
  let ppd        = clamp(document.getElementById('points_per_day').value, 0, 1e6);
  let mult       = clamp(document.getElementById('multiplier_inp').value, 0, 1e4);
  return { network, market, yt, underlying, ppd, mult };
}

/* 网络安全：超时封装 */
function fetchWithTimeout(url, params={}, timeoutMs=12000){
  const u = new URL(url);
  Object.entries(params).forEach(([k,v])=>u.searchParams.set(k,v));
  const ctrl = new AbortController();
  const t = setTimeout(()=>ctrl.abort(), timeoutMs);
  return fetch(u.toString(), {
    signal: ctrl.signal,
    referrerPolicy: 'no-referrer',
    mode: 'cors'
  }).finally(()=>clearTimeout(t));
}

async function fetchJSON(url, params={}){
  const resp = await fetchWithTimeout(url, params, 12000);
  if (!resp.ok) throw new Error(`HTTP ${resp.status} ${resp.statusText}`);
  return resp.json();
}

async function getAssetsAll(networkName){
  const path=NETWORK_PATH[networkName.toLowerCase()];
  return fetchJSON(`https://api-v2.pendle.finance/core/v3${path}/assets/all`);
}

/* 分页上限，避免资源耗尽 */
async function getTransactionsAll(networkName, marketAddr){
  const MAX_PAGES = 8; // ~8000 rows upper bound
  const id=NETWORK_IDS[networkName.toLowerCase()];
  const base=`https://api-v2.pendle.finance/core/v4/${id}/transactions`;
  let results=[], skip=0, resumeToken=null, pages=0;

  while (pages < MAX_PAGES) {
    const params={ market:marketAddr, action:'SWAP_PT,SWAP_PY,SWAP_YT', origin:'PENDLE_MARKET,YT', limit:'1000', minValue:'0' };
    if (resumeToken) params.resumeToken=resumeToken; else params.skip=String(skip);

    let data;
    try{
      data = await fetchJSON(base, params);
    }catch(e){
      throw new Error(`Network error while fetching transactions: ${String(e.message||e)}`);
    }
    const page=Array.isArray(data?.results)?data.results:[];
    if (page.length===0) break;
    results.push(...page);

    pages += 1;
    if (data?.resumeToken) resumeToken=data.resumeToken;
    else if (!resumeToken) skip += 1000;

    if (pages >= MAX_PAGES) {
      console.warn('Truncated transactions due to page cap');
      break;
    }
    await sleep(160 + Math.random()*100);
  }
  const seen=new Set(), dedup=[];
  for (const r of results){ if (r?.id && !seen.has(r.id)){ seen.add(r); dedup.push(r); } }
  return dedup;
}

/* 计算与绘图 */
function compute({transactions, maturity, underlyingAmount, pointsPerDayPerUnderlying, multiplier}){
  const tTimes=[], implied=[], valuationUSD=[];
  for (const tx of transactions){
    const t=new Date(tx.timestamp); if (isNaN(t)) continue;
    tTimes.push(t);
    const iA=Number(tx?.impliedApy); implied.push(isFinite(iA)?iA:NaN);
    const usd=Number(tx?.valuation?.usd ?? tx?.valuation_usd); valuationUSD.push(isFinite(usd)?usd:0);
  }
  const totalUSD=valuationUSD.reduce((a,b)=>a+(isFinite(b)?b:0),0);
  const weightedImplied = totalUSD>0
    ? implied.reduce((acc,iA,idx)=>acc+(isFinite(iA)&&isFinite(valuationUSD[idx])?iA*valuationUSD[idx]:0),0)/totalUSD
    : NaN;

  const maturityDate = new Date(maturity);
  const hoursToMaturity = tTimes.map(t => (maturityDate - t)/3600000);

  const pph = pointsPerDayPerUnderlying/24, mult = multiplier;
  const ytPrice=[], points=[];
  for (let i=0;i<tTimes.length;i++){
    const iA=implied[i], h=hoursToMaturity[i];
    if (!isFinite(iA) || !isFinite(h)){ ytPrice.push(NaN); points.push(NaN); continue; }
    const price = Math.pow(1+iA, h/8760) - 1;
    ytPrice.push(price);
    points.push((1/price) * h * pph * underlyingAmount * mult);
  }
  return { tTimes, ytPrice, points, weightedImplied, maturityDate };
}

function buildFairCurve(weightedImplied, tTimes, maturityDate){
  const fairX=[], fairY=[];
  if (!isFinite(weightedImplied) || !tTimes.length) return {fairX, fairY};
  const txTimesSorted=[...tTimes].sort((a,b)=>a-b);
  for (const t of txTimesSorted){
    const hrs=(maturityDate - t)/3600000;
    const fv = 1 - 1/Math.pow(1+weightedImplied, hrs/8760);
    fairX.push(t); fairY.push(fv);
  }
  let cursor = txTimesSorted.at(-1) || new Date();
  cursor = new Date(Date.UTC(cursor.getUTCFullYear(), cursor.getUTCMonth(), cursor.getUTCDate(), cursor.getUTCHours(),0,0));
  while (cursor <= maturityDate){
    const hrs=(maturityDate - cursor)/3600000;
    const fv = 1 - 1/Math.pow(1+weightedImplied, hrs/8760);
    fairX.push(new Date(cursor)); fairY.push(fv);
    cursor = new Date(cursor.getTime()+3600000);
  }
  return {fairX, fairY};
}

function plotChart({ tTimes, ytPrice, points, fairX, fairY }, symbol, networkName, underlyingAmount){
  const isDark = document.documentElement.getAttribute('data-theme')==='dark';
  const traces = [
    { x: tTimes, y: ytPrice, mode: 'lines', name: t('chartY1'), yaxis: 'y' },
    { x: tTimes, y: points, mode: 'lines', name: t('chartY2'), yaxis: 'y2' },
    { x: fairX, y: fairY, mode: 'lines', name: 'Fair Value Curve of YT', line: { dash: 'dot', width: 3 }, yaxis: 'y' }
  ];
  const layout = {
    title: t('chartTitle', symbol, networkName, underlyingAmount),
    margin:{l:60,r:60,t:60,b:50},
    legend:{orientation:'h', yanchor:'bottom', y:1.02, xanchor:'right', x:1},
    xaxis:{ title:t('chartXAxis') },
    yaxis:{ title:t('chartY1'), side:'left' },
    yaxis2:{ title:t('chartY2'), overlaying:'y', side:'right' },
    paper_bgcolor: isDark ? '#0b0f16' : '#ffffff',
    plot_bgcolor:  isDark ? '#0b0f16' : '#ffffff',
    font:{ color: isDark ? '#e6edf3' : '#0b1220' }
  };
  Plotly.newPlot('chart', traces, layout, {responsive:true});
  window.__plot_inited = true;
  setTimeout(()=>Plotly.Plots.resize('chart'),0);
}

/* 交互：放到 DOMContentLoaded，避免注入/顺序问题 */
document.addEventListener('DOMContentLoaded', () => {
  const tg = document.getElementById('toggleTheme');
  const lg = document.getElementById('langToggle');
  const rn = document.getElementById('run');
  tg && tg.addEventListener('click', toggleTheme);
  lg && lg.addEventListener('click', () => { LANG = (LANG === 'en') ? 'zh' : 'en'; applyLang(); });
  rn && rn.addEventListener('click', runOnce);
});

/* Run 主流程（内含二次兜底 ensurePlotly） */
async function runOnce(){
  hideError(); setLoading(true);
  addClass('chartCard','hidden');
  addClass('meta','hidden');

  let networkSel, marketAddr, ytAddr, underlyingAmount, pointsPerDay, multiplier;
  try{
    await ensurePlotly(); // 二次兜底：即便上面预载失败，这里也再保一遍
    const s = sanitizeInputs();
    networkSel = s.network; marketAddr = s.market; ytAddr = s.yt;
    underlyingAmount = s.underlying; pointsPerDay = s.ppd; multiplier = s.mult;

    // 资产信息
    const assetsResp = await getAssetsAll(networkSel);
    const assets = Array.isArray(assetsResp?.assets)?assetsResp.assets:[];
    const validYT = assets.find(item =>
      item && Array.isArray(item.tags) && item.tags.includes('YT') &&
      String(item.address).toLowerCase() === ytAddr && item.expiry
    );
    if (!validYT) throw new Error(t('errNotFound'));
    const symbolText = validYT.symbol || 'YT';
    const maturityDateObj = parseExpiry(validYT.expiry);
    if (isNaN(maturityDateObj)) throw new Error(t('errExpiry', validYT.expiry));

    // 交易
    const txns = await getTransactionsAll(networkSel, marketAddr);

    // 计算
    const { tTimes, ytPrice, points, weightedImplied, maturityDate } = compute({
      transactions: txns, maturity: maturityDateObj.toISOString(),
      underlyingAmount, pointsPerDayPerUnderlying: pointsPerDay, multiplier
    });
    const { fairX, fairY } = buildFairCurve(weightedImplied, tTimes, maturityDate);

    // 元信息
    document.getElementById('symbol').textContent   = symbolText;
    document.getElementById('maturity').textContent = maturityDateObj.toISOString().replace('T',' ').replace('.000Z','Z');
    document.getElementById('wImplied').textContent = isFinite(weightedImplied)? fmtPct(weightedImplied) : '-';
    document.getElementById('netpill').textContent  = networkSel;
    document.getElementById('kv_txn').textContent   = (new Set(txns.map(x=>x.id)).size || 0).toLocaleString();
    document.getElementById('kv_wimplied').textContent = isFinite(weightedImplied)? fmtPct(weightedImplied) : '-';

    // 现在买入可获积分
    const lastTx = txns.reduce((best,cur)=>!best || new Date(cur.timestamp)>new Date(best.timestamp)?cur:best, null);
    const iA_now = (lastTx && isFinite(+lastTx.impliedApy)) ? +lastTx.impliedApy : (isFinite(weightedImplied)?weightedImplied:NaN);
    const hoursToMatNow = (maturityDate - new Date())/3600000;
    let nowPoints = NaN;
    if (isFinite(iA_now) && hoursToMatNow>0) {
      const priceNow = Math.pow(1+iA_now, hoursToMatNow/8760) - 1;
      const pph = pointsPerDay/24;
      nowPoints = (1/priceNow) * hoursToMatNow * pph * underlyingAmount * multiplier;
    } else if (hoursToMatNow<=0) {
      nowPoints = 0;
    }
    document.getElementById('kv_now').textContent = isFinite(nowPoints)? fmtNum(nowPoints) : '-';

    // 显示 & 绘图
    rmClass('meta','hidden');
    rmClass('chartCard','hidden');
    plotChart({ tTimes, ytPrice, points, fairX, fairY }, symbolText, networkSel, underlyingAmount);

  }catch(e){
    showError(String(e?.message||e));
  }finally{
    setLoading(false);
  }
}

/* 初始：英文 + 深色 */
applyLang();
