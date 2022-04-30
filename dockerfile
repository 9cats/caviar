FROM node:16-alpine
# Create app directory
WORKDIR /app
# Bundle app source
COPY . .
# install the dependencies and build
RUN npm config set registry http://mirrors.cloud.tencent.com/npm/
# open port 3000
EXPOSE 3000
# run the app
CMD npm i && npm run build && npm run start
