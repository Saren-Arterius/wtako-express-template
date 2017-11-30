FROM node:9-alpine

RUN npm install nodemon -g

RUN mkdir /src
WORKDIR /src

RUN sh -c 'echo "http://dl-cdn.alpinelinux.org/alpine/edge/community" >> /etc/apk/repositories && apk update'

ADD package.json /src/package.json
ADD nodemon.json /src/nodemon.json
RUN npm install --production

CMD npm start
