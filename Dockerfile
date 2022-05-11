# develop stage
FROM node:18 as build-stage
WORKDIR /app
RUN yarn global add pnpm @quasar/cli @nestjs/cli
RUN pnpm -r install