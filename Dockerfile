# === BASE IMAGE UNTUK BUILD & DEV ===
FROM node:23 AS base
WORKDIR /app
COPY . .

# Install dependencies
RUN npm install
RUN npx update-browserslist-db@latest

# === STAGE BUILD (PRODUCTION) ===
FROM base AS build
WORKDIR /app/packages/demo
RUN npm run build

# === STAGE PRODUCTION (NGINX) ===
FROM nginx:1.27.4-alpine-slim AS prod

# Bersihkan konfigurasi default
RUN rm /etc/nginx/conf.d/default.conf

# Copy konfigurasi custom (jika ada)
COPY nginx.conf /etc/nginx/nginx.conf
COPY default.conf /etc/nginx/conf.d/default.conf

# Copy hasil build dari stage build
COPY --from=build /app/packages/demo/build /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
