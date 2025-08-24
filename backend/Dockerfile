# -------- Build stage --------
FROM node:20-alpine AS build
WORKDIR /app

# Copy package.json trước
COPY package.json ./

# Nếu có package-lock.json thì copy, còn không cũng không sao
COPY package-lock.json* ./

# Nếu có lockfile thì npm ci, còn không thì npm install
RUN if [ -f package-lock.json ]; then \
      npm ci --omit=dev; \
    else \
      npm install --omit=dev; \
    fi

# Copy toàn bộ source code
COPY . .

# -------- Production stage --------
FROM node:20-alpine
WORKDIR /app

# Copy toàn bộ app đã build từ stage trước
COPY --from=build /app ./

# Mở port (optional, để dễ debug khi chạy container standalone)
EXPOSE 3000

# Chạy app
CMD ["npm", "start"]
