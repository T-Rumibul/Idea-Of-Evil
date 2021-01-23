FROM node:12-alpine
WORKDIR /
COPY . .
RUN yarn install
CMD ["yarn", "start"]