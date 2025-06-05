# Dockerfile เป็นเหมือนแบบแปลน (layout) ที่บอกวิธีสร้างสิ่งที่ใช้รันแอปใน container 

# runtime
FROM node:18

WORKDIR /nodejs-university
COPY package.json .
RUN npm install
COPY . .
CMD ["node", "server.js"]