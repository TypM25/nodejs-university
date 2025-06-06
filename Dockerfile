FROM node:18
WORKDIR /nodejs-university
COPY package*.json ./
RUN npm install

# เพื่อ “รอ” ให้ PostgreSQL พร้อมใช้งานก่อนรัน app
# ติดตั้ง netcat-openbsd เพื่อให้ container มีคำสั่ง nc ที่ช่วยให้สคริปต์รอเชื่อมต่อกับฐานข้อมูลได้ถูกต้องครับ
RUN apt-get update && apt-get install -y netcat-openbsd

COPY . .
RUN chmod +x wait-for-it.sh
CMD ["./wait-for-it.sh", "postgresdb:5432", "--", "node", "server.js"]
