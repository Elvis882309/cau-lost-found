// app.js —— 前端交互逻辑（原生 JS，无构建步骤）
const $ = (s) => document.querySelector(s);
const list = $('#list');
const empty = $('#empty');
let currentType = 'found';

// 工具：时间格式化
function timeAgo(iso) {
  const d = new Date(iso), now = new Date();
  const diff = Math.floor((now - d) / 1000);
  if (diff < 60) return '刚刚';
  if (diff < 3600) return `${Math.floor(diff / 60)} 分钟前`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} 小时前`;
  if (diff < 86400 * 30) return `${Math.floor(diff / 86400)} 天前`;
  return d.toLocaleDateString('zh-CN');
}

// 加载列表
async function load() {
  const q = $('#search').value.trim();
  const category = $('#fCategory').value;
  const campus = $('#fCampus').value;
  const params = new URLSearchParams({ type: currentType, status: 'open' });
  if (q) params.set('q', q);
  if (category) params.set('category', category);
  if (campus) params.set('campus', campus);

  const res = await fetch('/api/items?' + params);
  const data = await res.json();
  list.innerHTML = '';
  if (!data.items.length) { empty.classList.remove('hidden'); return; }
  empty.classList.add('hidden');
  data.items.forEach((it) => list.appendChild(renderCard(it)));
}

// 渲染卡片
function renderCard(it) {
  const card = document.createElement('div');
  card.className = 'card';
  const thumb = it.image
    ? `<img class="thumb" src="${it.image}" alt="物品图片" />`
    : `<div class="thumb"></div>`;
  card.innerHTML = `
    ${thumb}
    <div class="info">
      <p class="title">${esc(it.title)}</p>
      <div class="meta">
        <span class="tag">${esc(it.category)}</span>
        <span class="tag">${esc(it.campus)}</span>
        ${it.location ? `<span>${esc(it.location)}</span>` : ''}
        <span>· ${timeAgo(it.created_at)}</span>
      </div>
      ${it.description ? `<p class="desc">${esc(it.description)}</p>` : ''}
      <p class="contact">${esc(it.contact_type || '联系')}：${esc(it.contact)}</p>
    </div>
    <div class="actions">
      <button class="mini-btn" data-claim="${it.id}">已解决</button>
      <button class="mini-btn danger" data-del="${it.id}">删除</button>
    </div>
  `;
  card.querySelector('[data-claim]').onclick = () => claim(it.id);
  card.querySelector('[data-del]').onclick = () => del(it.id);
  return card;
}

function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

// 标记已解决
async function claim(id) {
  if (!confirm('确认该物品已归还/已解决？')) return;
  await fetch(`/api/items/${id}/claim`, { method: 'PATCH' });
  toast('已标记为已解决 🎉'); load();
}

// 删除（管理口令）
async function del(id) {
  const key = prompt('请输入管理口令以删除（默认 cau2024）：', 'cau2024');
  if (key === null) return;
  const res = await fetch(`/api/items/${id}`, {
    method: 'DELETE', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ key }),
  });
  const data = await res.json();
  toast(data.msg);
  if (data.ok) load();
}

// Toast
let toastTimer;
function toast(msg) {
  const t = $('#toast');
  t.textContent = msg; t.classList.remove('hidden');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.add('hidden'), 2200);
}

// 事件绑定
$('#tabs').addEventListener('click', (e) => {
  const btn = e.target.closest('.tab');
  if (!btn) return;
  document.querySelectorAll('.tab').forEach((t) => t.classList.remove('active'));
  btn.classList.add('active');
  currentType = btn.dataset.type;
  load();
});
$('#search').addEventListener('input', debounce(load, 300));
$('#fCategory').addEventListener('change', load);
$('#fCampus').addEventListener('change', load);

function debounce(fn, ms) {
  let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); };
}

// 发布弹层
const modal = $('#modal');
$('#postBtn').onclick = () => modal.classList.remove('hidden');
$('#closeModal').onclick = () => modal.classList.add('hidden');
modal.addEventListener('click', (e) => { if (e.target === modal) modal.classList.add('hidden'); });

$('#postForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target;
  const fd = new FormData(form);
  const res = await fetch('/api/items', { method: 'POST', body: fd });
  const data = await res.json();
  if (!data.ok) { toast(data.msg); return; }
  toast('发布成功，感谢互助 🌱');
  form.reset();
  modal.classList.add('hidden');
  currentType = fd.get('type');
  document.querySelectorAll('.tab').forEach((t) => t.classList.toggle('active', t.dataset.type === currentType));
  load();
});

load();
