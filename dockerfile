FROM node:16-alpine
# Create app directory
WORKDIR /root/app
# Bundle app source
COPY . .
# open port 3000
EXPOSE 3000
# Change timezone to shanghai
ENV TZ='Asia/Shanghai'
# run the app
CMD npm i --registry=https://registry.npm.taobao.org && npm run build && npm run start
