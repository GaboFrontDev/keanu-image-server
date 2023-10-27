FROM --platform=amd64 node:20-alpine

WORKDIR /usr/app

COPY . .

RUN npm install


CMD ["npm", "run", "dev"]