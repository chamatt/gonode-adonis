FROM node:8

WORKDIR . /app

COPY package*.json ./

RUN npm i -g @adonisjs/cli nodemon

RUN npm install

COPY . .

EXPOSE 3334

CMD ["/init.sh"]
