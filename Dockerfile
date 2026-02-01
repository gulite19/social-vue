# ---------- 1. 构建阶段 ----------
FROM node:20-alpine AS builder

WORKDIR /app

# 先复制依赖文件（利用缓存）
COPY package*.json ./
RUN npm install

# 再复制全部源码
COPY . .

# 构建生产环境代码
RUN npm run build


# ---------- 2. 运行阶段 ----------
FROM nginx:1.25-alpine

# 删除 nginx 默认页面
RUN rm -rf /usr/share/nginx/html/*

# 把构建好的 dist 拷贝到 nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# 使用自定义 nginx 配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
