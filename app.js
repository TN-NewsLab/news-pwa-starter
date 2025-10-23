// News PWA Starter logic
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);
const statusEl = $('#status');
const listEl = $('#newsList');
const cardTpl = document.getElementById('newsCard');

const fmtTime = (iso) => {
  try {
    const d = new Date(iso);
    return d.toLocaleString('ja-JP', {year:'numeric', month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit'});
  } catch { return ''; }
};

async function loadNews() {
  statusEl.textContent = '読み込み中…';
  try {
    const res = await fetch('./data/news.json', { cache: 'no-store' });
    const data = await res.json();
    // ★ まずピックアップ（featured）があれば先に描画
    if (data.featured && data.featured.length > 0) {
      renderList(data.featured, true);
    }
    // ★ 次に通常の記事
    renderList(data.articles || []);
    statusEl.textContent = '最新データを表示中';
  } catch (e) {
    console.error(e);
    statusEl.textContent = 'オフラインのため、キャッシュを表示中（ある場合）';
  }
}

function renderList(items, isFeatured = false) {
  if (!items.length) return;

  for (const it of items) {
    const node = cardTpl.content.cloneNode(true);
    node.querySelector('.source').textContent = it.source || '';
    node.querySelector('.time').textContent = fmtTime(it.date || it.published_at || '');
    node.querySelector('.title').textContent = it.title || '';
    node.querySelector('.summary').innerHTML = (it.summary || '').replace(/\n/g, '<br>');

    // ★ ピックアップには目立つラベルをつける
    if (isFeatured) {
      node.querySelector('.title').insertAdjacentHTML('afterbegin', '🔥 ');
    }

    const a = node.querySelector('.link');
    a.href = it.url || '#';
    listEl.appendChild(node);
  }
}

document.getElementById('reloadBtn').addEventListener('click', () => loadNews());

// Hide A2HS tip when in standalone (iOS)
function inStandaloneMode() {
  return (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || window.navigator.standalone === true;
}
if (inStandaloneMode()) {
  const tip = document.getElementById('a2hsTip');
  if (tip) tip.style.display = 'none';
}

loadNews();
