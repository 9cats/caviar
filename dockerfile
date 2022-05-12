FROM node:16-alpine
# Create app directory
WORKDIR /root/app
# Bundle app source
COPY . .
# open port 3000
EXPOSE 3000
# run the app
CMD npm i --registry=https://registry.npm.taobao.org && npm run build && npm run start
