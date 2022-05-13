# develop stage
FROM node:18
WORKDIR /app
RUN yarn global add @nestjs/cli @quasar/cli