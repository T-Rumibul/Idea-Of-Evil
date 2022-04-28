FROM node:16-alpine
WORKDIR /
COPY . .
RUN npm install && npm run build
CMD ["npm", "start"]