FROM node:10
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
ENV waittime 86400
CMD [ "bash", "startup.sh" ]
