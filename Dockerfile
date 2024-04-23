FROM node:19-alpine
RUN apk add g++ make py3-pip
RUN npm install pm2 -g
RUN apk add  --no-cache ffmpeg
WORKDIR /
COPY . .
RUN npm install && npm run build
CMD ["pm2-runtime", "dist/index.js"]

# docker run --env-file ./env.list -dit --restart unless-stopped rynerno/ioebot  
# docker build --tag rynerno/ioebot:latest .
