FROM node:20-alpine AS deps

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

FROM node:20-alpine AS runtime

WORKDIR /app

ENV NODE_ENV=production

RUN apk upgrade --no-cache libcrypto3 libssl3 \
  && rm -rf /usr/local/lib/node_modules/npm /usr/local/bin/npm /usr/local/bin/npx

COPY --from=deps --chown=node:node /app/node_modules ./node_modules
COPY --chown=node:node . .

USER node

EXPOSE 4002

CMD ["node", "server.js"]
