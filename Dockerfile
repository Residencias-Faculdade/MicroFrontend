# STAGE 1: BUILD - Compila Vite (TS -> JS) dentro do container
FROM node:22-alpine AS build
WORKDIR /app
# Copia manifests primeiro para cachear npm ci
COPY package*.json ./
RUN npm ci --legacy-peer-deps || npm install --legacy-peer-deps
# Copia resto e builda (tsc + vite build -> dist/)
COPY . .
RUN npm run build

# STAGE 2: RUNTIME - Serve dist/ com Nginx
FROM nginx:alpine AS runtime
# config SPA + cache
COPY nginx.conf /etc/nginx/conf.d/default.conf
# estaticos da shell
COPY --from=build /app/dist /usr/share/nginx/html/
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]