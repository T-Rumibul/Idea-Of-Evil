FROM node:16-alpine
WORKDIR /
COPY . .
RUN yarn install
CMD ["yarn", "start"]