# 中国农业大学失物招领平台 —— 容器化部署
FROM node:20-alpine

WORKDIR /app

# 安装构建依赖（better-sqlite3 需编译）
RUN apk add --no-cache python3 make g++

COPY package.json ./
RUN npm install --omit=dev

COPY . .
RUN npm install

# 数据卷：保证容器重启后数据不丢
VOLUME ["/app/data", "/app/uploads"]

ENV PORT=3000
EXPOSE 3000

CMD ["node", "server.js"]
