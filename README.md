# 🌾 CAU 失物招领（中国农业大学失物招领平台）

> 一个为**中国农业大学**同学打造的校园失物招领 Web 应用：东校区 / 西校区通用，手机端友好，发布即同步、联网即可用。**零前端构建、零外部服务依赖**，一份代码一键部署到任意云平台，也可直接开源到 GitHub。

---

## ✨ 功能特性

- **两栏切换**：「招领（捡到）」与「失物（丢失）」一目了然
- **分类与校区筛选**：一卡通/校园卡、钥匙、书籍文具、电子数码、衣物、伞具、证件、其他；支持东校区 / 西校区 / 不限
- **关键词搜索**：按标题、地点、描述实时检索
- **图片上传**：捡到实物可拍图上传（≤3MB，自动存本地）
- **一键认领 / 下架**：找回后标记「已解决」，管理口令删除过期信息
- **移动优先 UI**：手机浏览器直接访问，无需安装 App
- **轻量可部署**：SQLite 本地文件存储，不依赖 MySQL/Redis，开箱即用

## 🛠 技术栈

| 层 | 选型 | 说明 |
|---|---|---|
| 后端 | Node.js + Express | 提供 REST API |
| 数据库 | better-sqlite3 (SQLite) | 单文件数据库，零运维 |
| 图片 | multer | 本地磁盘存储 |
| 前端 | 原生 HTML/CSS/JS | 无构建步骤，直接打开即用 |

## 📁 目录结构

```
cau-lost-found/
├── server.js          # Express 服务与 API
├── db.js              # SQLite 建表与连接
├── seed.js            # 示例数据（CAU 真实场景）
├── package.json
├── Dockerfile         # 容器化部署
├── public/            # 前端静态资源
│   ├── index.html
│   ├── style.css
│   └── app.js
├── data/              # 运行时生成的数据库（已 gitignore）
└── uploads/           # 上传的图片（已 gitignore）
```

## 🚀 本地运行

```bash
# 1. 安装依赖
npm install

# 2. 写入示例数据（可选，体验用）
npm run seed

# 3. 启动服务
npm start
# 打开 http://localhost:3000
```

## ☁️ 部署到云端（让同学真正联网使用）

### 方式一：Render（推荐，免费）
1. 把本仓库 Push 到 GitHub
2. 打开 [render.com](https://render.com) → New → Web Service → 关联仓库
3. Build Command：`npm install`；Start Command：`npm start`
4. 添加环境变量 `ADMIN_KEY`（管理口令，用于删除信息）
5. 部署完成后获得 `https://xxx.onrender.com`，分享给同学即可

> ⚠️ 免费版 Render 实例休眠后，`data/` 与 `uploads/` 会被清空。请改用 **Render Disk** 挂载持久卷，或在「持久化」章节用数据库方案。

### 方式二：Railway
1. 关联 GitHub 仓库 → Deploy
2. 设置 `PORT` 由平台注入（代码已兼容）
3. 添加持久卷挂载 `/app/data` 与 `/app/uploads`

### 方式三：Docker / 自有服务器
```bash
docker build -t cau-lost-found .
docker run -d -p 3000:3000 \
  -v $(pwd)/data:/app/data \
  -v $(pwd)/uploads:/app/uploads \
  -e ADMIN_KEY=你的口令 \
  --name cau-lf cau-lost-found
```
再用 Nginx 反代 + 域名（如 `lost.cau.club`）即可全校访问。

### 方式四：学生权益部 / 社团服务器
直接 `npm install && npm start`，配合 `pm2` 守护进程与 Nginx 反代，零成本长期运行。

## 🔌 API 速览

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | `/api/items?type=&category=&campus=&q=&status=` | 列表 + 搜索 + 筛选 |
| GET | `/api/items/:id` | 物品详情 |
| POST | `/api/items` | 发布（表单含图片） |
| PATCH | `/api/items/:id/claim` | 标记已解决 |
| DELETE | `/api/items/:id` | 删除（需 `ADMIN_KEY`） |
| GET | `/api/stats` | 统计概览 |

## 📝 开源与贡献

本项目采用 **MIT 协议**，欢迎 Fork、Star、提交 PR。

1. Fork 本仓库并 Clone
2. 新建分支：`git checkout -b feature/xxx`
3. 提交修改后发起 Pull Request

建议的贡献方向：
- 接入企业微信 / 校内统一身份认证，杜绝虚假信息
- 一卡通「卡号/姓名」模糊匹配（保护隐私的认领校验）
- 邮件 / 推送通知，捡到即提醒失主
- 后台管理页面与会话鉴权

## ⚠️ 使用规范与隐私提示

- 本平台仅用于校内互助，**请勿发布敏感个人信息**（如完整身份证号、银行卡号）
- 交易、拾金索酬等请遵守校规与法律
- 联系方式的展示默认公开，发布前请确认可接受
- 管理员口令请通过环境变量配置，切勿提交到代码仓库

---

🌱 由热爱开源的 CAU 同学维护 · 让每一件遗失的物品都找到回家的路
