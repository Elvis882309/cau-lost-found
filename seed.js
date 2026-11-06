// seed.js —— 写入中国农业大学相关的示例数据，便于首次体验
import db from './db.js';

const samples = [
  {
    type: 'found', title: '一卡通（农学院 张同学）', category: '一卡通/校园卡', campus: '东校区',
    location: '一教 301 教室', description: '放学后在课桌上捡到，卡面有照片，姓名已遮挡一部分，请凭信息认领。',
    contact: '微信 cau_helper', contact_type: '微信',
  },
  {
    type: 'lost', title: '丢失蓝色折叠伞', category: '伞具', campus: '西校区',
    location: '公主楼食堂门口', description: '中午下雨天落在食堂门口伞架上，蓝色天堂伞，手柄处有挂绳。',
    contact: 'QQ 123456789', contact_type: 'QQ',
  },
  {
    type: 'found', title: 'AirPods Pro 耳机', category: '电子数码', campus: '东校区',
    location: '图书馆三楼研讨区', description: '白色充电盒，盒盖内侧有轻微划痕，捡到后已关机保管。',
    contact: '电话 13800000000', contact_type: '电话',
  },
  {
    type: 'lost', title: '金士顿 U 盘 64G', category: '电子数码', campus: '西校区',
    location: '工学院机房', description: '黑色金属外壳，里面是课程实验报告，急用，必有重谢！',
    contact: '邮箱 stu@cau.edu.cn', contact_type: '邮箱',
  },
  {
    type: 'found', title: '一串钥匙（含宿舍钥匙）', category: '钥匙', campus: '东校区',
    location: '研究生公寓 6 号楼', description: '钥匙扣是绿色小恐龙，含一把宿舍门禁卡。',
    contact: '微信 key_return', contact_type: '微信',
  },
  {
    type: 'lost', title: '《植物学》教材', category: '书籍文具', campus: '东校区',
    location: '旧图书馆二层', description: '蓝色封面，扉页写有名字和学号，内夹一张课表。',
    contact: 'QQ 987654321', contact_type: 'QQ',
  },
];

const insert = db.prepare(`
  INSERT INTO items (type, title, category, campus, location, description, contact, contact_type, image, status, created_at)
  VALUES (@type, @title, @category, @campus, @location, @description, @contact, @contact_type, '', 'open', @created_at)
`);

const clean = db.prepare('DELETE FROM items');
const run = db.transaction(() => {
  clean.run();
  samples.forEach((s, i) => {
    insert.run({ ...s, created_at: new Date(Date.now() - i * 3600_000).toISOString() });
  });
});
run();

console.log(`✅ 已写入 ${samples.length} 条示例数据`);
