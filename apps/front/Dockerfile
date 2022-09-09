FROM node:18 as build
COPY package.json /app/
# COPY *.lock /app/
WORKDIR /app
RUN yarn

FROM build as prod
RUN yarn build:ssr
WORKDIR /app/dist/ssr
RUN yarn
