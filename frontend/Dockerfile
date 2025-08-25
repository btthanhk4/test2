# -------- Build stage --------
FROM node:20-alpine AS build
WORKDIR /app

# Copy package metadata và cài deps
COPY package.json package-lock.json* ./
RUN npm ci || npm install

# Copy source code
COPY index.html ./
COPY src ./src

# Nhận giá trị backend url từ build-arg
ARG VITE_BACKEND_URL=/api
# Xuất nó thành biến môi trường để Vite sử dụng khi build
ENV VITE_BACKEND_URL=$VITE_BACKEND_URL

# Build FE (Vite sẽ đọc biến env này)
RUN npm run build

# -------- Serve stage --------
FROM nginx:1.27-alpine
# Copy build output sang nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Copy config nginx (reverse proxy nếu cần)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
