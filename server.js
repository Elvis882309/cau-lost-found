// server.js —— 中国农业大学失物招领平台后端服务
import express from 'express';
import multer from 'multer';
import { fileURLToPath } from 'url';
import { dirname, join, extname } from 'path';
import { mkdirSync, existsSync } from 'fs';
import db from './db.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3000;
// 简单的管理口令（环境变量注入），用于删除/下架物品，避免滥用
const ADMIN_KEY = process.env.ADMIN_KEY || 'cau2024';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 静态资源
const publicDir = join(__dirname, 'public');
const uploadsDir = join(__dirname, 'uploads');
mkdirSync(uploadsDir, { recursive: true });
app.use(express.static(publicDir));
app.use('/uploads', express.static(uploadsDir));

// 图片上传配置
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extname(file.originalname)}`;
    cb(null, unique);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 3 * 1024 * 1024 }, // 3MB
  fileFilter: (req, file, cb) => {
    if (/image\/(png|jpe?g|gif|webp)/.test(file.mimetype)) cb(null, true);
    else cb(new Error('仅支持图片文件（png/jpg/gif/webp）'));
  },
});

// ---------- 工具函数 ----------
const nowISO = () => new Date().toISOString();

// ---------- API: 列表 + 搜索 + 筛选 ----------
app.get('/api/items', (req, res) => {
  const { type, category, campus, q, status } = req.query;
  const where = [];
  const params = [];
  if (type) { where.push('type = ?'); params.push(type); }
  if (category) { where.push('category = ?'); params.push(category); }
  if (campus) { where.push('campus = ?'); params.push(campus); }
  if (status) { where.push('status = ?'); params.push(status); }
  if (q) {
    where.push('(title LIKE ? OR description LIKE ? OR location LIKE ?)');
    params.push(`%${q}%`, `%${q}%`, `%${q}%`);
  }
  const sql = `
    SELECT * FROM items
    ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
    ORDER BY created_at DESC
  `;
  const items = db.prepare(sql).all(...params);
  res.json({ ok: true, count: items.length, items });
});

// ---------- API: 统计 ----------
app.get('/api/stats', (req, res) => {
  const row = db.prepare(`
    SELECT
      COUNT(*) AS total,
      SUM(type='lost' AND status='open') AS lost_open,
      SUM(type='found' AND status='open') AS found_open,
      SUM(status='claimed') AS claimed
    FROM items
  `).get();
  res.json({ ok: true, stats: row });
});

// ---------- API: 详情 ----------
app.get('/api/items/:id', (req, res) => {
  const item = db.prepare('SELECT * FROM items WHERE id = ?').get(req.params.id);
  if (!item) return res.status(404).json({ ok: false, msg: '未找到该物品' });
  res.json({ ok: true, item });
});

// ---------- API: 发布 ----------
app.post('/api/items', upload.single('image'), (req, res) => {
  const { type, title, category, campus, location, description, contact, contact_type } = req.body;
  if (!type || !title || !category || !campus || !contact) {
    return res.status(400).json({ ok: false, msg: '缺少必填字段（类型/标题/分类/校区/联系方式）' });
  }
  const info = db.prepare(`
    INSERT INTO items (type, title, category, campus, location, description, contact, contact_type, image, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'open', ?)
  `).run(
    type, title, category, campus, location || '', description || '',
    contact, contact_type || '', req.file ? `/uploads/${req.file.filename}` : '', nowISO()
  );
  const item = db.prepare('SELECT * FROM items WHERE id = ?').get(info.lastInsertRowid);
  res.json({ ok: true, item });
});

// ---------- API: 标记已认领/已解决 ----------
app.patch('/api/items/:id/claim', (req, res) => {
  const item = db.prepare('SELECT * FROM items WHERE id = ?').get(req.params.id);
  if (!item) return res.status(404).json({ ok: false, msg: '未找到该物品' });
  db.prepare(`UPDATE items SET status = 'claimed', claimed_at = ? WHERE id = ?`).run(nowISO(), req.params.id);
  res.json({ ok: true, msg: '已标记为已解决' });
});

// ---------- API: 删除（需管理口令） ----------
app.delete('/api/items/:id', (req, res) => {
  const { key } = req.body || {};
  if (key !== ADMIN_KEY) return res.status(403).json({ ok: false, msg: '管理口令错误' });
  const item = db.prepare('SELECT * FROM items WHERE id = ?').get(req.params.id);
  if (!item) return res.status(404).json({ ok: false, msg: '未找到该物品' });
  db.prepare('DELETE FROM items WHERE id = ?').run(req.params.id);
  res.json({ ok: true, msg: '已删除' });
});

// ---------- 兜底错误处理 ----------
app.use((err, req, res, next) => {
  if (err) return res.status(400).json({ ok: false, msg: err.message || '服务器错误' });
  next();
});

app.listen(PORT, () => {
  console.log(`🌱 中国农业大学失物招领平台已启动: http://localhost:${PORT}`);
});
