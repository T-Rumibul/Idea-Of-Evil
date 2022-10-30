FROM node:16-alpine
RUN apk add g++ make py3-pip
WORKDIR /
COPY . .
RUN npm install && npm run build
CMD ["npm", "start"]