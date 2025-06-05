# ใช้ Node.js image สำหรับการ build
FROM node:18 

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build
RUN npm run export

# ใช้ Nginx เพื่อ serve ไฟล์ static
FROM nginx:alpine

COPY --from=builder /app/out /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
