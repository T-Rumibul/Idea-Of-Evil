FROM node:16-alpine
RUN apk add g++ make py3-pip
RUN npm install pm2 -g
WORKDIR /
COPY . .
RUN npm install && npm run build
CMD ["pm2-runtime", "dist/index.js"]