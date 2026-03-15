FROM node:18-alpine

WORKDIR /usr/edi

COPY package*.json ./

RUN npm ci

COPY . .

EXPOSE 53493

CMD ["npm", "run", "edi"]