FROM node:18-alpine
# Create app directory
WORKDIR /root/app
# Bundle app source
COPY . .
RUN  npm i -g npm@latest && npm i && npm run build 
# open port 3000
EXPOSE 3000
# Change timezone to shanghai
ENV TZ='Asia/Shanghai'
# run the app
CMD npm run start
