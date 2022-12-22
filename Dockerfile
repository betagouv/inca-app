FROM node:16-alpine

# https://github.com/prisma/prisma/issues/16834#issuecomment-1355195025
RUN apk add --update --no-cache openssl1.1-compat

ARG NEXT_PUBLIC_EDDSA_PUBLIC_KEY
ARG NODE_ENV=production

ENV NEXT_PUBLIC_EDDSA_PUBLIC_KEY=$NEXT_PUBLIC_EDDSA_PUBLIC_KEY
ENV NODE_ENV=$NODE_ENV

EXPOSE 3000

WORKDIR /app

COPY . .

RUN yarn --frozen-lockfile --production=false
RUN yarn build

ENTRYPOINT [ "yarn", "start" ]
