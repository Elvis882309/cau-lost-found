// db.js —— 基于 better-sqlite3 的轻量数据库封装
// 数据库文件位于 data/lostfound.db，首次运行自动建表。
import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { mkdirSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, 'data');
mkdirSync(dataDir, { recursive: true });

const db = new Database(join(dataDir, 'lostfound.db'));
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS items (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    type        TEXT    NOT NULL,        -- 'lost' 失物 | 'found' 招领
    title       TEXT    NOT NULL,
    category    TEXT    NOT NULL,        -- 物品分类
    campus      TEXT    NOT NULL,        -- 校区：东校区 / 西校区 / 不限
    location    TEXT,                    -- 具体地点
    description TEXT,
    contact     TEXT    NOT NULL,        -- 联系方式
    contact_type TEXT,                   -- 微信 / QQ / 电话 / 邮箱
    image       TEXT,                    -- 图片相对路径（可选）
    status      TEXT    NOT NULL DEFAULT 'open', -- open / claimed / closed
    created_at  TEXT    NOT NULL,        -- ISO 时间
    claimed_at  TEXT
  );
`);

export default db;
