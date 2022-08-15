FROM node:18
USER root
COPY package.json /app/
COPY *.lock /app/
WORKDIR /app

RUN mkdir -p /app/uploads/avatar

RUN yarn
