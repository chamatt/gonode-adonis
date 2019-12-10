FROM node:8

WORKDIR . /app

COPY package*.json ./

RUN npm i -g @adonisjs/cli nodemon

RUN npm install

COPY . .

EXPOSE 8080

CMD ["/init.sh"]
