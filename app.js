/* LEO 软件中心 — 数据驱动渲染；下载一律跳转到 GitHub，站点本身不托管安装包 */
const $ = (s, el = document) => el.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const num = n => (n == null ? '' : new Intl.NumberFormat().format(n));
const fmtSize = b => {
  if (!b) return '';
  const u = ['B', 'KB', 'MB', 'GB']; let i = 0;
  while (b >= 1024 && i < u.length - 1) { b /= 1024; i++; }
  return b.toFixed(b < 10 && i > 0 ? 1 : 0) + ' ' + u[i];
};
const GH = 'https://github.com/';
/* 下载地址永远指向 GitHub 仓库页面，站点不存放任何安装包 */
const repoUrl = p => (p.repo ? GH + p.repo : (p.releaseUrl || '#'));
const releasesUrl = p => (p.repo ? `${GH}${p.repo}/releases/latest` : (p.releaseUrl || '#'));

let PRODUCTS = [];

/* ---------- 渲染 ---------- */
function renderFilters() {
  const cats = ['全部', ...new Set(PRODUCTS.map(p => p.category).filter(Boolean))];
  $('#filters').innerHTML = cats.map((c, i) =>
    `<button class="chip${i === 0 ? ' active' : ''}" data-cat="${esc(c)}">${esc(c)}</button>`).join('');
  $('#filters').addEventListener('click', e => {
    const b = e.target.closest('.chip'); if (!b) return;
    [...$('#filters').children].forEach(x => x.classList.remove('active'));
    b.classList.add('active');
    renderGrid(b.dataset.cat);
  });
}

function actionButtons(p, assets) {
  const b = [];
  const list = assets || [];
  if (list.length) {
    const size = [...new Set(list.map(a => a.size).filter(Boolean))].join(' / ');
    b.push(`<a class="btn primary" href="${esc(releasesUrl(p))}" target="_blank" rel="noopener">⬇ 去 GitHub 下载${size ? ` · ${esc(size)}` : ''}</a>`);
  } else if (p.repo) {
    b.push(`<a class="btn primary" href="${esc(releasesUrl(p))}" target="_blank" rel="noopener">查看 GitHub ↗</a>`);
  }
  if (p.repo) {
    b.push(`<a class="btn ghost" href="${esc(repoUrl(p))}" target="_blank" rel="noopener">源码 ↗</a>`);
    b.push(`<a class="btn ghost" href="${GH}${esc(p.repo)}/releases" target="_blank" rel="noopener">版本记录</a>`);
  }
  return b.join('');
}

function detail(p) {
  const feats = (p.features || []).length
    ? `<ul class="feature-list">${p.features.map(f => `<li>${esc(f)}</li>`).join('')}</ul>` : '';
  const inst = (p.install || []).length
    ? `<ol class="install">${p.install.map(s => `<li>${esc(s)}</li>`).join('')}</ol>` : '';
  if (!feats && !inst) return '';
  return `<details class="more"><summary>详情 · 安装说明</summary>
    ${feats}${inst ? `<p class="muted small" style="margin:12px 0 0">安装步骤</p>${inst}` : ''}
    ${p.repo ? `<p class="muted small" style="margin:12px 0 0">安装包托管在 GitHub：<a href="${esc(releasesUrl(p))}" target="_blank" rel="noopener">前往 Releases ↗</a></p>` : ''}</details>`;
}

function card(p) {
  const plats = [...new Set([...(p.platforms || []), p.license].filter(Boolean))]
    .filter(x => x !== p.category).map(x => `<span class="plat">${esc(x)}</span>`).join('');
  const cat = p.category ? `<span class="badge">${esc(p.category)}</span>` : '';
  return `<article class="card" id="card-${esc(p.id)}">
    <div class="card-top">
      <div class="tile">${esc(p.emoji || '📦')}</div>
      <div style="flex:1">
        <h3>${esc(p.name)} <span class="badge ver" id="ver-${esc(p.id)}">${p.version ? 'v' + esc(p.version) : ''}</span></h3>
        <p class="tagline">${esc(p.tagline || '')}</p>
      </div>
    </div>
    <p class="summary">${esc(p.summary || '')}</p>
    <div class="plats">${cat}${plats}</div>
    <div class="card-actions" id="dl-${esc(p.id)}">${actionButtons(p, p.assets)}</div>
    <div class="meta" id="meta-${esc(p.id)}"></div>
    ${detail(p)}
  </article>`;
}

function renderGrid(cat) {
  const list = (cat === '全部' || !cat) ? PRODUCTS : PRODUCTS.filter(p => p.category === cat);
  $('#grid').innerHTML = list.map(card).join('') || '<p class="muted">这个分类下暂时没有软件。</p>';
  enrich(list);
}

/* ---------- 拉取 GitHub 最新 release，实时更新版本 / 下载量（仅用于展示，不托管文件）---------- */
let stats = { downloads: 0, count: 0 };
async function enrich(list) {
  stats = { downloads: 0, count: PRODUCTS.length };
  await Promise.all(PRODUCTS.map(async p => {
    if (!p.repo) return;
    try {
      const r = await fetch(`https://api.github.com/repos/${p.repo}/releases/latest`, { headers: { Accept: 'application/vnd.github+json' } });
      if (!r.ok) return;
      const rel = await r.json();
      const live = (rel.assets || []);
      const dlCount = live.reduce((s, a) => s + (a.download_count || 0), 0);
      stats.downloads += dlCount;
      const assets = live.map(a => ({
        label: a.name.replace(/\.[a-z0-9]+$/i, ''),
        size: fmtSize(a.size)
      }));
      const vb = document.getElementById('ver-' + p.id); if (vb && rel.tag_name) vb.textContent = rel.tag_name;
      const dl = document.getElementById('dl-' + p.id); if (dl && assets.length) dl.innerHTML = actionButtons(p, assets);
      const meta = document.getElementById('meta-' + p.id);
      if (meta) meta.innerHTML = `<span>最新 ${esc(rel.tag_name || '')}</span><span>${esc((rel.published_at || '').slice(0, 10))}</span><span>累计下载 ${num(dlCount)}</span>`;
    } catch (e) { /* 静默回退到 JSON 数据 */ }
  }));
  const st = $('#stats');
  if (st) st.innerHTML =
    `<div class="stat"><b>${num(PRODUCTS.length)}</b>款软件</div>` +
    (stats.downloads ? `<div class="stat"><b>${num(stats.downloads)}</b>次下载</div>` : '') +
    `<div class="stat"><b>100%</b>本地优先</div>`;
}

/* ---------- 启动 ---------- */
(async function init() {
  $('#year').textContent = new Date().getFullYear();
  try {
    const res = await fetch('data/products.json', { cache: 'no-cache' });
    const data = await res.json();
    const site = data.site || {};
    if (site.github) { $('#gh').href = site.github; $('#hero-gh').href = site.github; }
    PRODUCTS = data.products || [];
    renderFilters();
    renderGrid('全部');
  } catch (e) {
    $('#grid').innerHTML = '<p class="muted">无法加载软件数据（data/products.json）。</p>';
  }
})();
