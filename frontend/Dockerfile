FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginxinc/nginx-unprivileged:1.29-alpine

# Image runs as non-root user 'nginx' (uid 101) by default
COPY nginx/default.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
