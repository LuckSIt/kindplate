FROM node:22-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . ./

# Build args для Vite переменных окружения
# /api — same-origin proxy через Caddy, решает проблему cookie на iOS PWA
ARG VITE_BACKEND_BASE_URL=/api
ARG VITE_VAPID_PUBLIC_KEY=
ARG VITE_BACKEND_FALLBACK_URL=
ARG VITE_YMAPS_API_KEY=

# Передаём в ENV для использования в npm run build
ENV NODE_ENV=production
ENV VITE_BACKEND_BASE_URL=${VITE_BACKEND_BASE_URL}
ENV VITE_VAPID_PUBLIC_KEY=${VITE_VAPID_PUBLIC_KEY}
ENV VITE_BACKEND_FALLBACK_URL=${VITE_BACKEND_FALLBACK_URL}
ENV VITE_YMAPS_API_KEY=${VITE_YMAPS_API_KEY}

RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx","-g","daemon off;"]


