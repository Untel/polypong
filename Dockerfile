FROM node:18 as pnpm
WORKDIR /polypong
RUN yarn global add pnpm @quasar/cli @nestjs/cli
ADD pnpm-workspace.yaml .
ADD pnpm-lock.yaml .
ADD apps/front/package.json ./apps/front
ADD apps/api/package.json ./apps/api
RUN pnpm fetch --prod

RUN pnpm install -r --offline --prod

# FROM pnpm as front
# RUN pnpm install

# FROM pnpm as api
# RUN pnpm install