FROM node:14.19-alpine3.15

WORKDIR /app
COPY package.json .
RUN npm install
COPY . . 
EXPOSE 3000
CMD [ "node", "index.js" ]