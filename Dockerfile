FROM node:16-alpine

ARG DATABASE_URL
ARG NEXT_PUBLIC_RSA_PUBLIC_KEY
ARG NODE_ENV=production

ENV DATABASE_URL=$DATABASE_URL
ENV NEXT_PUBLIC_RSA_PUBLIC_KEY=$NEXT_PUBLIC_RSA_PUBLIC_KEY
ENV NODE_ENV=$NODE_ENV

EXPOSE 3000

WORKDIR /app

COPY . .

RUN yarn --production --pure-lockfile
RUN yarn build

ENTRYPOINT [ "yarn", "start" ]
